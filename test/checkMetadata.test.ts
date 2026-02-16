import {checkMetadata} from '../src/checkMetadata'
import * as metadataModule from '../src/metadata'

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

    // Mock URL accessibility to be true by default
    jest.spyOn(metadataModule, 'isUrlAccessible').mockResolvedValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('an empty validation message', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    expect(message).toEqual({
      conclusion: 'success',
      name: './test/fixtures/metadata.rb',
      message: 'Metadata matches',
      summary: ['Metadata validated'],
      title: 'Metadata validated',
      errors: [],
      rawMetadata: expect.any(Object)
    })
    expect(message.rawMetadata?.name).toEqual('java')
    expect(message.rawMetadata?.version).toEqual('9.0.0')
  })
})

describe('An incorrect maintainer', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]

    jest.spyOn(metadataModule, 'isUrlAccessible').mockResolvedValue(true)
  })

  it('tells the user which property is not set correctly', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.incorrect.rb')
    expect(message.conclusion).toEqual('failure')
    expect(message.summary).toContain(
      "maintainer: expected 'Sous Chefs', got 'Bob'"
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

describe('Mandatory fields configuration', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]

    jest.spyOn(metadataModule, 'isUrlAccessible').mockResolvedValue(true)
  })

  it('fails if a field specified in mandatory_fields is missing', async () => {
    process.env['INPUT_MANDATORY_FIELDS'] =
      'name,maintainer,license,version,chef_version,supports,privacy'
    // metadata.rb is missing 'privacy'
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    expect(message.conclusion).toEqual('failure')
    expect(message.summary).toContain(
      'privacy: field is missing from metadata.rb'
    )
  })

  it('passes if all specified mandatory fields are present', async () => {
    process.env['INPUT_MANDATORY_FIELDS'] = 'name,version'
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    expect(message.conclusion).toEqual('success')
  })
})
