import * as core from '@actions/core'
import * as github from '@actions/github'
import {Message} from './messageInterface'

export const reportChecks = async (message: Message): Promise<void> => {
  core.info(`Reporting checks: ${JSON.stringify(message)}`)

  core.info('Finding PR number')
  // const pr = github.context.payload.pull_request

  core.info('posting check')
  await github
    .getOctokit(core.getInput('token', {required: true}))
    .rest.checks.update({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: message.name,
      // run_id: github.context.runId,
      // head_sha: pr?.head.sha,
      head_sha: github.context.sha,
      status: 'completed',
      conclusion: message.conclusion,
      output: {
        title: message.title,
        summary: message.summary
      }
    })

  core.info(
    `Report checks result: ${JSON.stringify(github.context.payload.after)}`
  )
}
