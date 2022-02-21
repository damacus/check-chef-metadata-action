import * as core from '@actions/core'
import * as fs from 'fs'
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

  try {
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
    message: 'Metadata matches',
    conclusion: 'success',
    comment: '',
    name: 'Metadata validation',
    summary: 'Metadata validation passed',
    title: 'Metadata validation result'
  }

  if (data.get('maintainer_email') !== maintainer_email) {
    message.comment += `\nMaintainer email is not set to ${maintainer_email} (currently set to ${data.get(
      'maintainer_email'
    )})`
    message.conclusion = 'failure'
    message.summary = 'Metadata validation failed'
  }

  if (data.get('maintainer') !== maintainer) {
    message.message = "Metadata doesn't match"
    message.comment += `\nMaintainer is not set to ${maintainer} (currently set to ${data.get(
      'maintainer'
    )})`
    message.conclusion = 'failure'
    message.summary = 'Metadata validation failed'
  }

  if (data.get('license') !== license) {
    message.message = "Metadata doesn't match"
    message.comment += `\nLicense is not set to ${license} (currently set to ${data.get(
      'license'
    )})`
    message.conclusion = 'failure'
    message.summary = 'Metadata validation failed'
  }

  if (data.get('source_url') !== source_url) {
    message.message = "Metadata doesn't match"
    message.comment += `\nSource URL is not set to ${source_url} (currently set to ${data.get(
      'source_url'
    )})`
    message.conclusion = 'failure'
    message.summary = 'Metadata validation failed'
  }

  if (data.get('issues_url') !== issues_url) {
    message.message = "Metadata doesn't match"
    message.comment += `\nIssues URL is not set to ${issues_url} (currently set to ${data.get(
      issues_url
    )})`
    message.conclusion = 'failure'
    message.summary = 'Metadata validation failed'
  }

  return message
}
