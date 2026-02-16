import {run} from '../src/main'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {glob} from 'glob'
import {mocked} from 'jest-mock'

jest.mock('@actions/github')
jest.mock('@actions/core')
jest.mock('glob')

const mockedGithub = mocked(github, {shallow: true})
const mockedCore = mocked(core, {shallow: true})
const mockedGlob = mocked(glob as any)

describe('run', () => {
  beforeEach(() => {
    jest.resetAllMocks()

    // Default glob mock
    mockedGlob.mockResolvedValue(['metadata.rb'])

    mockedCore.getInput.mockImplementation((name: string) => {
      if (name === 'file_path') return 'metadata.rb'
      return ''
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
})
