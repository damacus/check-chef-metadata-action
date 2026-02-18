import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {Message, Conclusion, AnnotationLevel} from './messageInterface'
import {
  metadata,
  isValidSemVer,
  isValidVersionConstraint,
  isValidSupport,
  isValidDepends,
  isUrlAccessible
} from './metadata'

/**
 * Capitalizes the first letter of a string
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Validates email format using a basic regex pattern
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates SPDX license identifier format
 * This is a basic validation - for production, consider using the official SPDX license list
 */
function isValidSPDXLicense(license: string): boolean {
  // Basic SPDX license format validation
  // Should be alphanumeric with hyphens, dots, and plus signs
  const spdxRegex = /^[A-Za-z0-9][A-Za-z0-9.-]*[A-Za-z0-9]$|^[A-Za-z0-9]$/
  return spdxRegex.test(license) && license.length > 0
}

/**
 * Common SPDX license identifiers for additional validation
 */
const COMMON_SPDX_LICENSES = [
  'Apache-2.0',
  'MIT',
  'GPL-2.0',
  'GPL-3.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'MPL-2.0',
  'LGPL-2.1',
  'LGPL-3.0',
  'CC0-1.0',
  'Unlicense'
]

export async function checkMetadata(
  file: fs.PathLike,
  options: {urlTimeout?: number; urlRetries?: number} = {}
): Promise<Message> {
  /**
   * Read metadata file
   * Check it has:
   * - A correct issues URL
   * - A correct source URL (same as the HTTP clone URL)
   * maintainer URL should be the same as is configured in the config.yaml
   * contain one of the accepted licences
   */

  try {
    core.info(`Reading metadata file: ${file}`)
    fs.accessSync(file, fs.constants.R_OK)
  } catch (err) {
    core.error(`${file}: access error!`)
  }

  const {urlTimeout = 5000, urlRetries = 2} = options
  const {data, lines} = metadata(file)
  const maintainer: string = core.getInput('maintainer')
  const maintainer_email: string = core.getInput('maintainer_email')
  const license: string = core.getInput('license')

  // Validate inputs
  if (maintainer_email && !isValidEmail(maintainer_email)) {
    throw new Error(
      `Invalid email format for maintainer_email: ${maintainer_email}`
    )
  }

  if (license && !isValidSPDXLicense(license)) {
    core.warning(
      `License '${license}' may not be a valid SPDX identifier. Common licenses: ${COMMON_SPDX_LICENSES.join(
        ', '
      )}`
    )
  }
  const source_url = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}`
  const issues_url = `${source_url}/issues`

  const message: Message = {
    name: file.toString(),
    message: 'Metadata matches',
    conclusion: 'success' as Conclusion,
    summary: ['Metadata validated'],
    title: 'Metadata validated',
    errors: [],
    rawMetadata: Object.fromEntries(data)
  }

  const getLine = (field: string, index?: number): number | undefined => {
    const lineVal = lines.get(field)
    if (Array.isArray(lineVal)) {
      return index !== undefined ? lineVal[index] : lineVal[0]
    }
    return lineVal
  }

  const checkField = (
    field: string,
    expected: string,
    actual: string | undefined
  ): void => {
    if (actual !== expected) {
      message.conclusion = 'failure'
      const line = getLine(field)

      message.errors?.push({
        field,
        expected,
        actual: actual || 'MISSING',
        line,
        path: file.toString(),
        level: 'failure'
      })

      const displayActual = actual || 'MISSING'
      const summaryMsg = `${field}: expected '${expected}', got '${displayActual}'`
      message.summary.push(summaryMsg)

      core.error(`${field}: expected '${expected}', got '${displayActual}'`, {
        file: file.toString(),
        startLine: line,
        title: `Metadata/${capitalize(field)}`
      })
    }
  }

  // 1. Existing Field Content Checks
  checkField(
    'maintainer_email',
    maintainer_email,
    data.get('maintainer_email') as string
  )
  checkField('maintainer', maintainer, data.get('maintainer') as string)
  checkField('license', license, data.get('license') as string)
  checkField('source_url', source_url, data.get('source_url') as string)
  checkField('issues_url', issues_url, data.get('issues_url') as string)

  // 2. URL Accessibility Checks
  const actualSourceUrl = data.get('source_url') as string
  if (actualSourceUrl) {
    const isAccessible = await isUrlAccessible(actualSourceUrl, urlTimeout, urlRetries)
    if (!isAccessible) {
      message.conclusion = 'failure'
      const line = getLine('source_url')
      const summaryMsg = `source_url: '${actualSourceUrl}' is not accessible`
      message.summary.push(summaryMsg)
      message.errors?.push({
        field: 'source_url',
        expected: 'HTTP 200',
        actual: 'UNREACHABLE',
        line,
        path: file.toString(),
        level: 'warning'
      })
      core.warning(`source_url: '${actualSourceUrl}' is not accessible`, {
        file: file.toString(),
        startLine: line,
        title: 'Metadata/Reachability'
      })
    }
  }

  const actualIssuesUrl = data.get('issues_url') as string
  if (actualIssuesUrl) {
    const isAccessible = await isUrlAccessible(actualIssuesUrl, urlTimeout, urlRetries)
    if (!isAccessible) {
      message.conclusion = 'failure'
      const line = getLine('issues_url')
      const summaryMsg = `issues_url: '${actualIssuesUrl}' is not accessible`
      message.summary.push(summaryMsg)
      message.errors?.push({
        field: 'issues_url',
        expected: 'HTTP 200',
        actual: 'UNREACHABLE',
        line,
        path: file.toString(),
        level: 'warning'
      })
      core.warning(`issues_url: '${actualIssuesUrl}' is not accessible`, {
        file: file.toString(),
        startLine: line,
        title: 'Metadata/Reachability'
      })
    }
  }

  // 3. Mandatory Field Existence
  const mandatoryFieldsInput =
    core.getInput('mandatory_fields', {required: false}) ||
    'version,chef_version,supports'
  const mandatoryFields = mandatoryFieldsInput
    .split(',')
    .map(f => f.trim())
    .filter(f => f !== '')

  for (const field of mandatoryFields) {
    const value = data.get(field)
    if (!value || (Array.isArray(value) && value.length === 0)) {
      message.conclusion = 'failure'
      const summaryMsg = `${field}: field is missing from metadata.rb`
      message.summary.push(summaryMsg)
      message.errors?.push({
        field,
        expected: 'Field to exist',
        actual: 'MISSING',
        line: undefined,
        path: file.toString(),
        level: 'failure'
      })
      core.error(`${field}: field is missing from metadata.rb`, {
        file: file.toString(),
        title: 'Metadata/MissingField'
      })
    }
  }

  // 4. Format Validations (if field is present)

  // Version
  const version = data.get('version') as string
  if (version && !isValidSemVer(version)) {
    message.conclusion = 'failure'
    const line = getLine('version')
    const summaryMsg = `version: '${version}' is not a valid Semantic Version`
    message.summary.push(summaryMsg)
    message.errors?.push({
      field: 'version',
      expected: 'SemVer string',
      actual: version,
      line,
      path: file.toString(),
      level: 'failure'
    })
    core.error(`version: '${version}' is not a valid Semantic Version`, {
      file: file.toString(),
      startLine: line,
      title: 'Metadata/VersionFormat'
    })
  }

  // Chef Version
  const chefVersion = data.get('chef_version') as string
  if (chefVersion && !isValidVersionConstraint(chefVersion)) {
    message.conclusion = 'failure'
    const line = getLine('chef_version')
    const summaryMsg = `chef_version: '${chefVersion}' is not a valid version constraint`
    message.summary.push(summaryMsg)
    message.errors?.push({
      field: 'chef_version',
      expected: 'Version constraint',
      actual: chefVersion,
      line,
      path: file.toString(),
      level: 'failure'
    })
    core.error(
      `chef_version: '${chefVersion}' is not a valid version constraint`,
      {
        file: file.toString(),
        startLine: line,
        title: 'Metadata/ChefVersionFormat'
      }
    )
  }

  // Supports
  const supports = data.get('supports') as string[]
  if (supports) {
    const supportsLines = lines.get('supports') as number[]
    for (let i = 0; i < supports.length; i++) {
      if (!isValidSupport(supports[i])) {
        message.conclusion = 'failure'
        const line = supportsLines[i]
        const summaryMsg = `supports: entry ${supports[i]} is malformed`
        message.summary.push(summaryMsg)
        message.errors?.push({
          field: 'supports',
          expected: 'Valid platform/constraint',
          actual: supports[i],
          line,
          path: file.toString(),
          level: 'failure'
        })
        core.error(`supports: entry ${supports[i]} is malformed`, {
          file: file.toString(),
          startLine: line,
          title: 'Metadata/SupportsFormat'
        })
      }
    }
  }

  // Depends
  const depends = data.get('depends') as string[]
  if (depends) {
    const dependsLines = lines.get('depends') as number[]
    for (let i = 0; i < depends.length; i++) {
      if (!isValidDepends(depends[i])) {
        message.conclusion = 'failure'
        const line = dependsLines[i]
        const summaryMsg = `depends: entry ${depends[i]} is malformed`
        message.summary.push(summaryMsg)
        message.errors?.push({
          field: 'depends',
          expected: 'Valid cookbook/constraint',
          actual: depends[i],
          line,
          path: file.toString(),
          level: 'failure'
        })
        core.error(`depends: entry ${depends[i]} is malformed`, {
          file: file.toString(),
          startLine: line,
          title: 'Metadata/DependsFormat'
        })
      }
    }
  }

  if (message.conclusion === 'failure') {
    message.summary = message.summary.filter(s => s !== 'Metadata validated')
    message.message = "Metadata doesn't match"
    message.title = 'Metadata validation failed'
  }

  return message
}
