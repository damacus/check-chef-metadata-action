import * as core from '@actions/core'
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

  it('does not emit annotations when metadata is valid', async () => {
    await checkMetadata('./test/fixtures/metadata.rb')
    expect(core.error).not.toHaveBeenCalled()
    expect(core.warning).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({file: expect.any(String)})
    )
  })
})

describe('An incorrect maintainer', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]

    jest.spyOn(metadataModule, 'isUrlAccessible').mockResolvedValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
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

  it('emits core.error annotation with file and line for field mismatch', async () => {
    await checkMetadata('./test/fixtures/metadata.incorrect.rb')
    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining("maintainer: expected 'Sous Chefs', got 'Bob'"),
      expect.objectContaining({
        file: './test/fixtures/metadata.incorrect.rb',
        startLine: expect.any(Number),
        title: 'Metadata/Maintainer'
      })
    )
  })

  it('sets level to failure on field mismatch errors', async () => {
    const message = await checkMetadata('./test/fixtures/metadata.incorrect.rb')
    const maintainerError = message.errors?.find(e => e.field === 'maintainer')
    expect(maintainerError?.level).toBe('failure')
  })
})

describe('URL reachability annotations', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('emits core.warning for unreachable URLs', async () => {
    jest.spyOn(metadataModule, 'isUrlAccessible').mockResolvedValue(false)

    await checkMetadata('./test/fixtures/metadata.rb')

    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('is not accessible'),
      expect.objectContaining({
        file: './test/fixtures/metadata.rb',
        title: 'Metadata/Reachability'
      })
    )
  })

  it('sets level to warning on URL reachability errors', async () => {
    jest.spyOn(metadataModule, 'isUrlAccessible').mockResolvedValue(false)

    const message = await checkMetadata('./test/fixtures/metadata.rb')

    const urlErrors = message.errors?.filter(e => e.actual === 'UNREACHABLE')
    expect(urlErrors).toBeDefined()
    expect(urlErrors!.length).toBeGreaterThan(0)
    for (const err of urlErrors!) {
      expect(err.level).toBe('warning')
    }
  })
})

describe('Mandatory fields configuration', () => {
  beforeEach(() => {
    for (const key in testEnvVars)
      process.env[key] = testEnvVars[key as keyof typeof testEnvVars]

    jest.spyOn(metadataModule, 'isUrlAccessible').mockResolvedValue(true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
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

  it('emits core.error annotation for missing mandatory fields', async () => {
    process.env['INPUT_MANDATORY_FIELDS'] = 'privacy'
    await checkMetadata('./test/fixtures/metadata.rb')

    expect(core.error).toHaveBeenCalledWith(
      'privacy: field is missing from metadata.rb',
      expect.objectContaining({
        file: './test/fixtures/metadata.rb',
        title: 'Metadata/MissingField'
      })
    )
  })

  it('sets level to failure on missing field errors', async () => {
    process.env['INPUT_MANDATORY_FIELDS'] = 'privacy'
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    const missingError = message.errors?.find(e => e.field === 'privacy')
    expect(missingError?.level).toBe('failure')
  })

  it('passes if all specified mandatory fields are present', async () => {
    process.env['INPUT_MANDATORY_FIELDS'] = 'name,version'
    const message = await checkMetadata('./test/fixtures/metadata.rb')
    expect(message.conclusion).toEqual('success')
  })
})
