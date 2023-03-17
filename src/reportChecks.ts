import * as core from '@actions/core'
import * as github from '@actions/github'
import {Message} from './messageInterface'

export const reportChecks = async (message: Message): Promise<void> => {
  try {
    const result = await github
      .getOctokit(core.getInput('github-token', {required: true}))
      .rest.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: message.name,
        head_sha: github.context.payload.pull_request?.head.sha,
        status: 'completed',
        conclusion: message.conclusion,
        output: {
          title: message.title,
          summary: message.summary.join('\n')
        }
      })
    core.info(JSON.stringify(result))
  } catch (error: unknown) {
    const err = (error as Error).message
    core.setFailed(err)
  }
}
