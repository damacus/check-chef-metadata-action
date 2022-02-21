import * as core from '@actions/core'
import {checkMetadata} from './checkMetadata'

async function run(): Promise<void> {
  const metadataCheck = await checkMetadata()
  core.info('Hello from the action!')
  core.info(metadataCheck.message)

  if (metadataCheck.conclusion === 'failure') {
    core.setFailed(metadataCheck.comment)
  }
}

run()
