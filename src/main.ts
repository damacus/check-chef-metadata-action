import * as core from '@actions/core'
import * as github from '@actions/github'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'
import {reportPR} from './reportPR'

export async function run(): Promise<void> {
  try {
    const file_path = core.getInput('file_path', {required: false})
    const isFork = github.context.payload.pull_request?.head?.repo?.fork

    if (isFork) core.warning('Unable to report checks or comment on forks.')

    const check = toBoolean(core.getInput('report_checks', {required: false}))
    const comment = toBoolean(core.getInput('comment_on_pr', {required: false}))

    const report_checks = isFork ? false : check
    core.info(`report_checks: ${report_checks}`)

    const comment_on_pr = isFork ? false : comment
    core.info(`comment_on_pr: ${comment_on_pr}`)

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
