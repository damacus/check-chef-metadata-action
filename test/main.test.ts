import {run} from '../src/main'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {mocked} from 'jest-mock'

jest.mock('@actions/github')
jest.mock('@actions/core')

const mockedGithub = mocked(github, {shallow: true})
const mockedCore = mocked(core, {shallow: true})

describe('run', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('should show warning and on forks', () => {
    mockedGithub.context.payload.pull_request = {
      head: {repo: {fork: true}}
    } as any

    run()

    expect(mockedCore.warning).toHaveBeenCalledWith(
      'Unable to report checks or comment on forks or the main branch.'
    )
  })

  test('should not show warning for non-forks', () => {
    mockedGithub.context.payload.pull_request = {
      head: {repo: {fork: false}}
    } as any

    run()

    expect(mockedCore.warning).not.toHaveBeenCalled()
  })
})
