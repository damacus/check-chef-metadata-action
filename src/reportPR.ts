import * as core from '@actions/core'
import * as github from '@actions/github'
import replaceComment, {deleteComment} from '@aki77/actions-replace-comment'
import {markdownTable} from 'markdown-table'
import {Issue} from './issueInterface'
import {Message} from './messageInterface'

// Report the results of the checks to the PR
const commentGeneralOptions = async (): Promise<Issue> => {
  const pullRequestId = github.context.issue.number

  return {
    token: core.getInput('github-token', {required: true}),
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: pullRequestId
  }
}

/**
 * Reports the results of multiple checks to the PR as a single aggregated comment.
 * @param messages Array of validation result message objects.
 */
export const reportPR = async (
  messages: Message[] | Message
): Promise<void> => {
  const messageList = Array.isArray(messages) ? messages : [messages]

  core.info('Reporting the results of the checks to the PR')

  const pullRequestId = github.context.issue.number
  if (!pullRequestId) {
    core.info('No PR ID found, skipping PR comment')
    return
  }

  // Use job name to avoid race conditions between parallel jobs in the same PR
  const jobName = github.context.job
  const commentIdentifier = `Metadata summary [${jobName}]`

  const failures = messageList.filter(m => m.conclusion === 'failure')

  if (failures.length === 0) {
    core.info(`Deleting comment for ${jobName} as all checks passed`)
    await deleteComment({
      ...(await commentGeneralOptions()),
      body: commentIdentifier,
      startsWith: true
    })
    return
  }

  core.info(`Replacing the comment for ${jobName} with failures`)

  let body = `${commentIdentifier}\n# Metadata Validation Results\n\n`

  if (failures.length > 0) {
    const tableData = [
      ['Cookbook', 'Field', 'Expected', 'Actual', 'Line'],
      ...failures.flatMap(m =>
        (m.errors || []).map(err => [
          m.name.includes(' - ') ? m.name.split(' - ')[1] : m.name,
          err.field,
          err.expected,
          err.actual,
          err.line ? err.line.toString() : 'N/A'
        ])
      )
    ]
    body += `${markdownTable(tableData)}\n\n`
  }

  try {
    const options = await commentGeneralOptions()
    await replaceComment({
      ...options,
      body
    })
    core.info(`replaceComment successful for ${jobName}`)
  } catch (error) {
    core.error(
      `Error in replaceComment for ${jobName}: ${(error as Error).message}`
    )
  }
}
