import * as core from '@actions/core'
import {checkMetadata} from './checkMetadata'
import {reportChecks} from './reportChecks'
import {reportPR} from './reportPR'

async function run(): Promise<void> {
  try {
    const file_path = core.getInput('file_path', {required: false})
    const result = await checkMetadata(file_path)
    await reportChecks(result)
    await reportPR(result)
  } catch (error: unknown) {
    const err = (error as Error).message
    core.setFailed(err)
  }
}

run()
