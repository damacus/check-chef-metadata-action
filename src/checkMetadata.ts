import * as core from '@actions/core'
import * as github from '@actions/github'
import {Message} from './messageInterface'
import {metadata} from './metadata'

export async function checkMetadata(file = 'metadata.rb'): Promise<Message> {
  /**
   * Read metadata file
   * Check it has:
   * - A correct issues URL
   * - A correct source URL (same as the HTTP clone URL)
   * maintainer URL should be the same as is configured in the config.yaml
   * contain one of the accepted licences
   */

  const data = metadata(file)
  const maintainer: String = core.getInput('maintainer')
  const maintainer_email: String = core.getInput('maintainer_email')
  const license: String = 'Apache-2.0'
  const source_url = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}`
  const issues_url = `${source_url}/issues`

  const message = {
    message: 'Metadata matches',
    conclusion: 'success',
    comment: '',
    name: 'Metadata validation'
  }

  if (data.get('maintainer_email') !== maintainer_email) {
    message.comment += `\nMaintainer email is not set to ${maintainer_email}`
    message.conclusion = 'failure'
  }

  if (data.get('maintainer') !== maintainer) {
    message.comment += `\nMaintainer is not set to ${maintainer}`
    message.conclusion = 'failure'
  }

  if (data.get('license') !== license) {
    message.comment += `\nLicense is not set to ${license}`
    message.conclusion = 'failure'
  }

  if (data.get('source_url') !== source_url) {
    message.comment += `\nSource URL is not set to ${source_url}`
    message.conclusion = 'failure'
  }

  if (data.get('issues_url') !== issues_url) {
    message.comment += `\nIssues URL is not set to ${issues_url}`
    message.conclusion = 'failure'
  }

  return message
}
