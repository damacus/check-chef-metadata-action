import * as core from '@actions/core'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'
import {reportPR} from './reportPR'

async function run(): Promise<void> {
  try {
    const file_path = core.getInput('file_path', {required: false})
    const report_checks = core.getInput('report_checks', {required: false})
    const comment_on_pr = core.getInput('comment_on_pr', {required: false})

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
