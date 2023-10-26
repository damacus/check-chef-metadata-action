import * as core from '@actions/core'
import * as fs from 'fs'
import * as github from '@actions/github'
import {Message, Conclusion} from './messageInterface'
import {metadata} from './metadata'

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
  const maintainer: String = core.getInput('maintainer')
  const maintainer_email: String = core.getInput('maintainer_email')
  const license: String = core.getInput('license')
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
