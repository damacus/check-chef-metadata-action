import {checkMetadata} from '../src/checkMetadata'

const testEnvVars = {
  INPUT_MAINTAINER: 'Sous Chefs',
  INPUT_MAINTAINER_EMAIL: 'help@sous-chefs.org',
  GITHUB_REPOSITORY: 'sous-chefs/java'
}

describe('Correct metadata', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
  })
  it('an empty validation message', async () => {
    // beforeEach(() => {
    //   for (const key in testEnvVars)
    //     process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
    // })
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    expect(message).toEqual({
      message: 'Metadata matches',
      conclusion: 'success',
      comment: '',
      name: 'Metadata validation'
    })
  })
})

describe('An incorrect maintainer', () => {
  it('tells the user which property is not set correctly', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.incorrect.rb')
    expect(message).toEqual({
      message: 'Metadata matches',
      conclusion: 'failure',
      comment: `
Maintainer is not set to Sous Chefs`,
      name: 'Metadata validation'
    })
  })
})
