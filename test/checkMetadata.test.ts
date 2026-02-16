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
      name: 'Check Metadata',
      message: 'Metadata matches',
      summary: ['Metadata validated'],
      title: 'Metadata validated',
      errors: []
    })
  })
})

describe('An incorrect maintainer', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
  })

  it('tells the user which property is not set correctly', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.incorrect.rb')
    expect(message.conclusion).toEqual('failure')
    expect(message.summary).toContain(
      'maintainer is not set to Sous Chefs (currently set to Bob)'
    )
    expect(message.summary).toContain(
      "chef_version 'invalid' is not a valid version constraint"
    )
    expect(message.summary).toContain(
      "version '9.0' is not a valid Semantic Version"
    )
    expect(message.summary).toContain(
      "supports entry 'ubuntu', 'invalid' is malformed"
    )
    expect(message.errors).toContainEqual(
      expect.objectContaining({
        field: 'maintainer',
        actual: 'Bob',
        expected: 'Sous Chefs'
      })
    )
  })
})
