import * as core from '@actions/core'
import * as github from '@actions/github'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'
import {reportPR} from './reportPR'

export async function run(): Promise<void> {
  //  Exit early if the action is running on a fork or the main branch
  try {
    const isFork = github.context.payload.pull_request?.head?.repo?.fork
    const isMain = github.context.ref === 'refs/heads/main'

    if (isFork || !isMain) {
      core.error(
        'Unable to report checks or comment on forks or the main branch.'
      )
      core.notice(`isMain: ${isMain}`)
      core.notice(`isFork: ${isFork}`)
    }
  } catch (error: unknown) {
    const err = (error as Error).message
    core.setFailed(err)
  }

  try {
    const file_path = core.getInput('file_path', {required: false})
    const check = toBoolean(core.getInput('report_checks', {required: false}))
    const report_checks = check

    core.notice(`report_checks: ${report_checks}`)

    const comment_on_pr = toBoolean(
      core.getInput('comment_on_pr', {required: false})
    )
    core.notice(`comment_on_pr: ${comment_on_pr}`)
    const result = await checkMetadata(file_path)

    await Promise.all([
      report_checks ? reportChecks(result) : Promise.resolve(),
      comment_on_pr ? reportPR(result) : Promise.resolve()
    ])

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

function toBoolean(value: string): boolean {
  return value.toLowerCase() === 'true'
}
