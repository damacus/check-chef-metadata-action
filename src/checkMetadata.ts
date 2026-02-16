import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {Message, Conclusion, ValidationError} from './messageInterface'
import {
  metadata,
  isValidSemVer,
  isValidVersionConstraint,
  isValidSupport
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

  checkField(
    'maintainer_email',
    maintainer_email,
    data.get('maintainer_email') as string
  )
  checkField('maintainer', maintainer, data.get('maintainer') as string)
  checkField('license', license, data.get('license') as string)
  checkField('source_url', source_url, data.get('source_url') as string)
  checkField('issues_url', issues_url, data.get('issues_url') as string)

  if (message.conclusion === 'failure') {
    message.summary = message.summary.filter(s => s !== 'Metadata validated')
    message.message = "Metadata doesn't match"
    message.title = 'Metadata validation failed'
  }

  return message
}
