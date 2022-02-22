import {checkMetadata} from '../src/checkMetadata'

const testEnvVars = {
  INPUT_MAINTAINER: 'Sous Chefs',
  INPUT_MAINTAINER_EMAIL: 'help@sous-chefs.org',
  INPUT_LICENSE: 'Apache-2.0',
  GITHUB_REPOSITORY: 'sous-chefs/java'
}

describe('Correct metadata', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
  })
  it('an empty validation message', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    expect(message).toEqual({
      conclusion: 'success',
      comment: '',
      name: 'Check Metadata',
      message: 'Metadata matches',
      summary: ['Metadata validated'],
      title: 'Metadata validated'
    })
  })
})

describe('An incorrect maintainer', () => {
  it('tells the user which property is not set correctly', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.incorrect.rb')
    expect(message).toEqual({
      conclusion: 'failure',
      comment: '',
      name: 'Check Metadata',
      message: "Metadata doesn't match",
      summary: ['Maintainer is not set to Sous Chefs (currently set to Bob)'],
      title: 'Metadata validation failed'
    })
  })
})
