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
  if (!pullRequestId) throw new Error('Cannot find the PR id.')

  const failures = messageList.filter(m => m.conclusion === 'failure')

  if (failures.length === 0) {
    core.info('Deleting comment as all checks passed')
    await deleteComment({
      ...(await commentGeneralOptions()),
      body: `Metadata summary`,
      startsWith: true
    })
    return
  }

  core.info('Replacing the comment with failures')

  let body = `Metadata summary\n# Metadata Validation Results\n\nFound ${failures.length} cookbook(s) with validation errors.\n\n`

  for (const failure of failures) {
    body += `## ${failure.name}\n${failure.summary.join('\n')}\n`

    if (failure.errors && failure.errors.length > 0) {
      const tableData = [
        ['Field', 'Expected', 'Actual', 'Line'],
        ...failure.errors.map(err => [
          err.field,
          err.expected,
          err.actual,
          err.line ? err.line.toString() : 'N/A'
        ])
      ]
      body += `\n${markdownTable(tableData)}\n\n`
    }
    body += '---\n'
  }

  await replaceComment({
    ...(await commentGeneralOptions()),
    body
  })
}
