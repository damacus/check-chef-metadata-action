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
 * Reports the results of the checks to the PR as a comment.
 * If the checks passed, any existing metadata comment is deleted.
 * If the checks failed, a new comment is created or an existing one is updated with a summary table.
 * @param message The validation result message object.
 */
export const reportPR = async (message: Message): Promise<void> => {
  core.info('Reporting the results of the checks to the PR')
  core.info(`Message: ${JSON.stringify(message)}`)

  const pullRequestId = github.context.issue.number

  if (!pullRequestId) throw new Error('Cannot find the PR id.')

  if (message.conclusion === 'success') {
    core.info('Deleting comment')
    await deleteComment({
      ...(await commentGeneralOptions()),
      body: `Metadata summary`,
      startsWith: true
    })
    return
  }

  core.info('Replacing the comment')

  let body = `Metadata summary\n## ${message.title}\n\n${message.summary.join(
    '\n'
  )}`

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
    body += `\n\n${markdownTable(tableData)}`
  }

  await replaceComment({
    ...(await commentGeneralOptions()),
    body
  })
}
