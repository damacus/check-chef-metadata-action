import * as core from '@actions/core'
import * as github from '@actions/github'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'
import {reportPR} from './reportPR'

async function run(): Promise<void> {
  try {
    const file_path = core.getInput('file_path', {required: false})
    const isFork = github.context.payload.pull_request?.head?.repo?.fork

    if (isFork) {
      core.warning('Unable to report checks of comment on forks.')
    }

    const report_checks =
      isFork || core.getInput('report_checks', {required: false})

    const comment_on_pr =
      isFork || core.getInput('comment_on_pr', {required: false})

    const result = await checkMetadata(file_path)

    if (report_checks) {
      await reportChecks(result)
    }

    if (comment_on_pr) {
      await reportPR(result)
    }

    // If the check failed, set the action as failed
    // If we don't do this the action will be marked as successful
    if (result.conclusion === 'failure') {
      core.setFailed('Metadata check failed')
    }
  } catch (error: unknown) {
    const err = (error as Error).message
    core.setFailed(err)
  }
}

run()
