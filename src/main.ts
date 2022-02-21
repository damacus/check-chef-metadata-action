import * as core from '@actions/core'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'

async function run(): Promise<void> {
  const metadataCheck = await checkMetadata()
  core.info(`Metadata check: ${metadataCheck.message}`)
  core.debug(`Metadata check: ${JSON.stringify(metadataCheck)}`)
  core.error(`Metadata check: ${JSON.stringify(metadataCheck)}`)
  core.warning(`Metadata check: ${JSON.stringify(metadataCheck)}`)
  console.log('Metadata check:', JSON.stringify(metadataCheck))
  await reportChecks(metadataCheck)
}

run()
