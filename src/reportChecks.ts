import * as core from '@actions/core'
import * as github from '@actions/github'
import {markdownTable} from 'markdown-table'
import {Message} from './messageInterface'

// Reports the results of multiple checks through a single consolidated Checks API run

export const reportChecks = async (
  messages: Message[] | Message
): Promise<void> => {
  const messageList = Array.isArray(messages) ? messages : [messages]

  try {
    const failures = messageList.filter(m => m.conclusion === 'failure')
    const overallConclusion = failures.length > 0 ? 'failure' : 'success'

    let summary =
      failures.length > 0
        ? `Found ${failures.length} cookbook(s) with validation errors.`
        : 'All cookbooks validated successfully.'

    const allErrors = messageList.flatMap(m => m.errors || [])

    if (allErrors.length > 0) {
      const tableData = [
        ['Cookbook', 'Field', 'Expected', 'Actual', 'Line'],
        ...messageList.flatMap(m =>
          (m.errors || []).map(err => [
            m.name.includes(' - ') ? m.name.split(' - ')[1] : m.name,
            err.field,
            err.expected,
            err.actual,
            err.line ? err.line.toString() : 'N/A'
          ])
        )
      ]
      summary += `\n\n${markdownTable(tableData)}`
    }

    const annotations = allErrors.map(err => ({
      path: err.path || 'metadata.rb',
      start_line: err.line || 1,
      end_line: err.line || 1,
      annotation_level: 'failure' as const,
      message: `${err.field}: expected ${err.expected}, got ${err.actual}`,
      title: `Invalid ${err.field}`
    }))

    const result = await github
      .getOctokit(core.getInput('github-token', {required: true}))
      .rest.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: 'Metadata Validation',
        head_sha: github.context.payload.pull_request?.head.sha,
        status: 'completed',
        conclusion: overallConclusion,
        output: {
          title:
            overallConclusion === 'success'
              ? 'Metadata validated'
              : 'Metadata validation failed',
          summary,
          annotations:
            annotations.length > 0 ? annotations.slice(0, 50) : undefined // GitHub limit is 50 per call
        }
      })
    core.info(`Created check run: ${result.data.id}`)
  } catch (error: unknown) {
    const err = (error as Error).message
    core.error(`Failed to create check run: ${err}`)
  }
}
