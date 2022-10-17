import * as core from '@actions/core'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'
// import {reportPR} from './reportPR'

async function run(): Promise<void> {
  try {
    const result = await checkMetadata()
    await reportChecks(result)
  } catch (error: unknown) {
    const err = (error as Error).message
    core.setFailed(err)
  }
}

run()
