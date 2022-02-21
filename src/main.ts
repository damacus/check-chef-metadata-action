import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'

async function run(): Promise<void> {
  const metadataCheck = await checkMetadata()
  await reportChecks(metadataCheck)
}

run()
