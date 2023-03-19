import * as core from '@actions/core'
import * as github from '@actions/github'
import replaceComment, {deleteComment} from '@aki77/actions-replace-comment'
import {Issue} from './issueInterface'
import {Message} from './messageInterface'

// Report the results of the checks to the PR

const commentGeneralOptions = async (): Promise<Issue> => {
  const pullRequestId = github.context.issue.number
  if (!pullRequestId) {
    throw new Error('Cannot find the PR id.')
  }

  return {
    token: core.getInput('github-token', {required: true}),
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: pullRequestId
  }
}

export const reportPR = async (message: Message): Promise<void> => {
  const pullRequestId = github.context.issue.number
  if (!pullRequestId) {
    throw new Error('Cannot find the PR id.')
  }

  const title = message.title

  if (message.conclusion) {
    await deleteComment({
      ...(await commentGeneralOptions()),
      body: title,
      startsWith: true
    })
    return
  }

  await replaceComment({
    ...(await commentGeneralOptions()),
    body: `${message.comment}`
  })
}
