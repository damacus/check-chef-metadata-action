import * as core from '@actions/core'
import * as github from '@actions/github'
import {glob} from 'glob'
import * as path from 'path'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'
import {reportPR} from './reportPR'
import {Message} from './messageInterface'

export async function run(): Promise<void> {
  try {
    const file_pattern =
      core.getInput('file_path', {required: false}) || 'metadata.rb'
    const isFork = github.context.payload.pull_request?.head?.repo?.fork
    const isMain = github.context.ref === 'refs/heads/main'

    if (isFork) core.warning('Unable to report checks or comment on forks.')
    if (isMain)
      core.warning('Unable to report checks or comment on main branch.')

    const check_input = toBoolean(
      core.getInput('report_checks', {required: false})
    )
    const report_checks = !isFork && !isMain && check_input

    core.info(`report_checks: ${report_checks}`)

    const comment_input = toBoolean(
      core.getInput('comment_on_pr', {required: false})
    )
    const comment_on_pr = !isFork && !isMain && comment_input

    core.info(`comment_on_pr: ${comment_on_pr}`)

    const files = await glob(file_pattern)

    if (files.length === 0) {
      core.setFailed(
        `No metadata files found matching pattern: ${file_pattern}`
      )
      return
    }

    core.info(`Found ${files.length} metadata file(s) to check`)

    let overallSuccess = true
    const results: Message[] = []

    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file)
      core.info(`Checking metadata file: ${relativePath}`)

      const result = await checkMetadata(file)

      // Enhance result name/title with relative path
      result.name = relativePath
      result.title = `Validation for ${relativePath}`

      results.push(result)

      if (result.conclusion === 'failure') {
        overallSuccess = false
      }
    }

    // Consolidated reporting
    await Promise.all([
      report_checks ? reportChecks(results) : Promise.resolve(),
      comment_on_pr ? reportPR(results) : Promise.resolve()
    ])

    // Set Action Outputs
    const cookbookOutputs = results.map(r => ({
      name: r.rawMetadata?.name,
      version: r.rawMetadata?.version,
      path: r.name
    }))

    core.setOutput('cookbooks', JSON.stringify(cookbookOutputs))

    if (results.length === 1) {
      const singleResult = results[0]
      if (singleResult.rawMetadata?.name) {
        core.setOutput('cookbook-name', singleResult.rawMetadata.name as string)
      }
      if (singleResult.rawMetadata?.version) {
        core.setOutput(
          'cookbook-version',
          singleResult.rawMetadata.version as string
        )
      }
    }

    // If any check failed, set the action as failed
    if (!overallSuccess) {
      core.setFailed('Metadata check failed for one or more cookbooks')
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
