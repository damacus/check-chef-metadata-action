import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {Message, Conclusion} from './messageInterface'
import {metadata} from './metadata'

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

  const data = metadata(file)
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

  const message = {
    name: 'Check Metadata',
    message: 'Metadata matches',
    conclusion: 'success' as Conclusion,
    summary: ['Metadata validated'],
    title: 'Metadata validated'
  }

  if (data.get('maintainer_email') !== maintainer_email) {
    message.conclusion = 'failure'
    message.summary = message.summary.filter(s => s !== 'Metadata validated')

    message.summary.push(
      `Maintainer email is not set to ${maintainer_email} (currently set to ${data.get(
        'maintainer_email'
      )})`
    )
  }

  if (data.get('maintainer') !== maintainer) {
    message.conclusion = 'failure'
    message.summary = message.summary.filter(s => s !== 'Metadata validated')

    message.summary.push(
      `Maintainer is not set to ${maintainer} (currently set to ${data.get(
        'maintainer'
      )})`
    )
  }

  if (data.get('license') !== license) {
    message.conclusion = 'failure'
    message.summary = message.summary.filter(s => s !== 'Metadata validated')

    message.summary.push(
      `License is not set to ${license} (currently set to ${data.get(
        'license'
      )})`
    )
  }

  if (data.get('source_url') !== source_url) {
    message.conclusion = 'failure'
    message.summary = message.summary.filter(s => s !== 'Metadata validated')

    message.summary.push(
      `Source URL is not set to ${source_url} (currently set to ${data.get(
        'source_url'
      )})`
    )
  }

  if (data.get('issues_url') !== issues_url) {
    message.conclusion = 'failure'
    message.summary = message.summary.filter(s => s !== 'Metadata validated')

    message.summary.push(
      `Issues URL is not set to ${issues_url} (currently set to ${data.get(
        'issues_url'
      )})`
    )
  }

  if (message.conclusion === 'failure') {
    message.message = "Metadata doesn't match"
    message.title = 'Metadata validation failed'
  }

  // If the conclusion of the message is 'failure', throw an error
  try {
    if (message.conclusion === 'failure') {
      throw new Error(message.summary.join(','))
    }
  } catch (error: unknown) {
    const err = (error as Error).message
    core.error(err)
  }

  return message
}
