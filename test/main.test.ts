import {run} from '../src/main'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {glob} from 'glob'
import {mocked} from 'jest-mock'
import {checkMetadata} from '../src/checkMetadata'

jest.mock('@actions/github')
jest.mock('@actions/core')
jest.mock('glob')
jest.mock('../src/checkMetadata')

const mockedGithub = mocked(github, {shallow: true})
const mockedCore = mocked(core, {shallow: true})
const mockedGlob = mocked(glob as any)
const mockedCheckMetadata = mocked(checkMetadata)

describe('run', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    // Default glob mock
    mockedGlob.mockResolvedValue(['metadata.rb'])

    mockedCore.getInput.mockImplementation((name: string) => {
      if (name === 'file_path') return 'metadata.rb'
      return ''
    })

    mockedCheckMetadata.mockResolvedValue({
      conclusion: 'success',
      name: 'Check Metadata',
      message: 'Metadata matches',
      summary: ['Metadata validated'],
      title: 'Metadata validated',
      errors: [],
      rawMetadata: {name: 'test-cookbook', version: '1.2.3'}
    })
  })

  test('should show warning and on forks', async () => {
    mockedGithub.context.payload.pull_request = {
      head: {repo: {fork: true}}
    } as any

    await run()

    expect(mockedCore.warning).toHaveBeenCalledWith(
      'Unable to report checks or comment on forks.'
    )
  })

  test('should not show warning for non-forks', async () => {
    mockedGithub.context.payload.pull_request = {
      head: {repo: {fork: false}}
    } as any

    await run()

    expect(mockedCore.warning).not.toHaveBeenCalled()
  })

  test('should set outputs for a single cookbook', async () => {
    mockedGithub.context.payload.pull_request = {
      head: {repo: {fork: false}}
    } as any

    await run()

    expect(mockedCore.setOutput).toHaveBeenCalledWith(
      'cookbook-name',
      'test-cookbook'
    )
    expect(mockedCore.setOutput).toHaveBeenCalledWith(
      'cookbook-version',
      '1.2.3'
    )
    expect(mockedCore.setOutput).toHaveBeenCalledWith(
      'cookbooks',
      expect.stringContaining('"name":"test-cookbook"')
    )
  })

  test('respects parallel_limit input', async () => {
    const files = Array(6).fill('metadata.rb')
    mockedGlob.mockResolvedValue(files)

    mockedCore.getInput.mockImplementation((name: string) => {
      if (name === 'file_path') return 'metadata.rb'
      if (name === 'parallel_limit') return '2'
      return ''
    })

    let concurrent = 0
    let maxConcurrent = 0
    mockedCheckMetadata.mockImplementation(async () => {
      concurrent++
      if (concurrent > maxConcurrent) maxConcurrent = concurrent
      await new Promise(resolve => setTimeout(resolve, 20))
      concurrent--
      return {
        conclusion: 'success',
        name: 'Check Metadata',
        message: 'Metadata matches',
        summary: ['Metadata validated'],
        title: 'Metadata validated',
        errors: [],
        rawMetadata: {name: 'test-cookbook', version: '1.2.3'}
      }
    })

    await run()

    expect(maxConcurrent).toBeLessThanOrEqual(2)
  })

  test('falls back to default parallel_limit on invalid input', async () => {
    mockedCore.getInput.mockImplementation((name: string) => {
      if (name === 'file_path') return 'metadata.rb'
      if (name === 'parallel_limit') return 'abc'
      return ''
    })

    await expect(run()).resolves.not.toThrow()
    expect(mockedCheckMetadata).toHaveBeenCalledTimes(1)
  })

  test('processes multiple cookbooks in parallel', async () => {
    const files = Array(10).fill('metadata.rb')

    // Mock glob to return 10 files

    mockedGlob.mockResolvedValue(files)

    mockedCheckMetadata.mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))

      return {
        conclusion: 'success',
        name: 'Check Metadata',
        message: 'Metadata matches',
        summary: ['Metadata validated'],
        title: 'Metadata validated',
        errors: [],
        rawMetadata: {name: 'test-cookbook', version: '1.2.3'}
      }
    })

    const start = Date.now()
    await run()
    const duration = Date.now() - start

    // 10 files * 50ms = 500ms sequentially.
    // Parallel (limit 10) should be closer to 50ms.
    // We allow some buffer for overhead.
    expect(duration).toBeLessThan(400)
  })
})
