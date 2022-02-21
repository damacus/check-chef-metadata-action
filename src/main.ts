import * as core from '@actions/core'
import * as github from '@actions/github'
import {checkMetadata} from './checkMetadata'

async function run(): Promise<void> {
  const metadataCheck = await checkMetadata()
  await github
    .getOctokit(core.getInput('token', {required: true}))
    .rest.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: 'metadata check',
      head_sha: github.context.sha,
      status: 'completed',
      conclusion: metadataCheck.conclusion,
      output: {
        title: 'metadata check',
        summary: metadataCheck.summary
      }
    })

  if (metadataCheck.conclusion === 'failure') {
    core.setFailed(metadataCheck.comment)
  }
}

run()
