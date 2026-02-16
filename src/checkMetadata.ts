import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {Message, Conclusion} from './messageInterface'
import {
  metadata,
  isValidSemVer,
  isValidVersionConstraint,
  isValidSupport,
  isValidDepends,
  isUrlAccessible
} from './metadata'

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

export async function checkMetadata(file: fs.PathLike): Promise<Message> {
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
    name: 'Check Metadata',
    message: 'Metadata matches',
    conclusion: 'success' as Conclusion,
    summary: ['Metadata validated'],
    title: 'Metadata validated',
    errors: []
  }

  const checkField = (
    field: string,
    expected: string,
    actual: string | undefined
  ): void => {
    if (actual !== expected) {
      message.conclusion = 'failure'
      const line = lines.get(field) as number | undefined

      message.errors?.push({
        field,
        expected,
        actual: actual || 'MISSING',
        line
      })

      const errorMsg = `${field} is not set to ${expected} (currently set to ${
        actual || 'MISSING'
      })`
      message.summary.push(errorMsg)

      // Emit annotation
      core.error(errorMsg, {
        file: file.toString(),
        startLine: line,
        title: `Invalid ${field}`
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
    const isAccessible = await isUrlAccessible(actualSourceUrl)
    if (!isAccessible) {
      message.conclusion = 'failure'
      const line = lines.get('source_url') as number | undefined
      const errorMsg = `source_url '${actualSourceUrl}' is not accessible`
      message.summary.push(errorMsg)
      message.errors?.push({
        field: 'source_url',
        expected: 'HTTP 200',
        actual: 'UNREACHABLE',
        line
      })
      core.error(errorMsg, {
        file: file.toString(),
        startLine: line,
        title: 'Unreachable Source URL'
      })
    }
  }

  const actualIssuesUrl = data.get('issues_url') as string
  if (actualIssuesUrl) {
    const isAccessible = await isUrlAccessible(actualIssuesUrl)
    if (!isAccessible) {
      message.conclusion = 'failure'
      const line = lines.get('issues_url') as number | undefined
      const errorMsg = `issues_url '${actualIssuesUrl}' is not accessible`
      message.summary.push(errorMsg)
      message.errors?.push({
        field: 'issues_url',
        expected: 'HTTP 200',
        actual: 'UNREACHABLE',
        line
      })
      core.error(errorMsg, {
        file: file.toString(),
        startLine: line,
        title: 'Unreachable Issues URL'
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
      const errorMsg = `${field} field is missing from metadata.rb`
      message.summary.push(errorMsg)
      message.errors?.push({
        field,
        expected: 'Field to exist',
        actual: 'MISSING',
        line: undefined
      })
      core.error(errorMsg, {file: file.toString(), title: `Missing ${field}`})
    }
  }

  // 4. Format Validations (if field is present)

  // Version
  const version = data.get('version') as string
  if (version && !isValidSemVer(version)) {
    message.conclusion = 'failure'
    const line = lines.get('version') as number | undefined
    const errorMsg = `version '${version}' is not a valid Semantic Version`
    message.summary.push(errorMsg)
    message.errors?.push({
      field: 'version',
      expected: 'SemVer string',
      actual: version,
      line
    })
    core.error(errorMsg, {
      file: file.toString(),
      startLine: line,
      title: 'Invalid Version'
    })
  }

  // Chef Version
  const chefVersion = data.get('chef_version') as string
  if (chefVersion && !isValidVersionConstraint(chefVersion)) {
    message.conclusion = 'failure'
    const line = lines.get('chef_version') as number | undefined
    const errorMsg = `chef_version '${chefVersion}' is not a valid version constraint`
    message.summary.push(errorMsg)
    message.errors?.push({
      field: 'chef_version',
      expected: 'Version constraint',
      actual: chefVersion,
      line
    })
    core.error(errorMsg, {
      file: file.toString(),
      startLine: line,
      title: 'Invalid Chef Version'
    })
  }

  // Supports
  const supports = data.get('supports') as string[]
  if (supports) {
    const supportsLines = lines.get('supports') as number[]
    for (let i = 0; i < supports.length; i++) {
      if (!isValidSupport(supports[i])) {
        message.conclusion = 'failure'
        const errorMsg = `supports entry ${supports[i]} is malformed`
        message.summary.push(errorMsg)
        message.errors?.push({
          field: 'supports',
          expected: 'Valid platform/constraint',
          actual: supports[i],
          line: supportsLines[i]
        })
        core.error(errorMsg, {
          file: file.toString(),
          startLine: supportsLines[i],
          title: 'Invalid Support'
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
        const errorMsg = `depends entry ${depends[i]} is malformed`
        message.summary.push(errorMsg)
        message.errors?.push({
          field: 'depends',
          expected: 'Valid cookbook/constraint',
          actual: depends[i],
          line: dependsLines[i]
        })
        core.error(errorMsg, {
          file: file.toString(),
          startLine: dependsLines[i],
          title: 'Invalid Dependency'
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
