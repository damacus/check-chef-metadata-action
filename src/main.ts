import * as core from '@actions/core'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'

async function run(): Promise<void> {
  try {
    const result = checkMetadata()
    reportChecks(await result)
    core.info(`Metadata check: ${JSON.stringify(result)}`)
  } catch (error: unknown) {
    const err = (error as Error).message
    core.setFailed(err)
  }
}

run()
