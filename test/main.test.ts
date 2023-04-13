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

  test('should show warning and set inputs for forks', () => {
    mockedGithub.context.payload.pull_request = {
      head: {repo: {fork: true}}
    } as any

    run()

    expect(mockedCore.warning).toHaveBeenCalledWith(
      'Unable to report checks of comment on forks.'
    )
    expect(mockedCore.getInput).not.toHaveBeenCalledWith('report_checks', {
      required: false
    })
    expect(mockedCore.getInput).not.toHaveBeenCalledWith('comment_on_pr', {
      required: false
    })
  })

  test('should not show warning and get inputs for non-forks', () => {
    mockedGithub.context.payload.pull_request = {
      head: {repo: {fork: false}}
    } as any

    run()

    expect(mockedCore.warning).not.toHaveBeenCalled()
    expect(mockedCore.getInput).toHaveBeenCalledWith('report_checks', {
      required: false
    })
    expect(mockedCore.getInput).toHaveBeenCalledWith('comment_on_pr', {
      required: false
    })
  })
})
