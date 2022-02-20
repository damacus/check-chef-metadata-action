import {Message} from './messageInterface'
import {checkMetadata} from './checkMetadata'

async function run(): Promise<void> {
  const checks: Message[] = []
  const metadataCheck = await checkMetadata()

  checks.push(metadataCheck)
}

run()
