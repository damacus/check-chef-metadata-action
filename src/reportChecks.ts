import * as core from '@actions/core'
import * as github from '@actions/github'
import {markdownTable} from 'markdown-table'
import {Message} from './messageInterface'

// Reports the results of the check through the Checks API

export const reportChecks = async (message: Message): Promise<void> => {
  try {
    let summary = message.summary.join('\n')

    if (message.errors && message.errors.length > 0) {
      const tableData = [
        ['Field', 'Expected', 'Actual', 'Line'],
        ...message.errors.map(err => [
          err.field,
          err.expected,
          err.actual,
          err.line ? err.line.toString() : 'N/A'
        ])
      ]
      summary += `\n\n${markdownTable(tableData)}`
    }

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
          summary
        }
      })
    core.info(JSON.stringify(result))
  } catch (error: unknown) {
    const err = (error as Error).message
    core.setFailed(err)
  }
}
