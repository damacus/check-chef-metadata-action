import * as core from '@actions/core'
import * as github from '@actions/github'
import {Message} from './messageInterface'

export const reportChecks = async (message: Message): Promise<void> => {
  core.info(`Reporting checks: ${JSON.stringify(message)}`)

  await github
    .getOctokit(core.getInput('token', {required: true}))
    .rest.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: message.name,
      head_sha: github.context.sha,
      status: 'completed',
      conclusion: message.conclusion,
      output: {
        title: message.title,
        summary: message.summary
      }
    })
}
