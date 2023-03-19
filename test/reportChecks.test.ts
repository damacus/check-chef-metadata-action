import * as core from '@actions/core'
import * as github from '@actions/github'
import {Message} from '../src/messageInterface'
import {reportChecks} from '../src/reportChecks'

// Mock the getOctokit function from the @actions/github package
jest.mock('@actions/github', () => {
  const {getOctokit} = jest.requireActual('@actions/github')
  return {
    getOctokit: jest.fn((token: string) => getOctokit(token)),
    context: {
      repo: {
        owner: 'owner',
        repo: 'repo'
      },
      payload: {
        pull_request: {
          head: {
            sha: 'pull-request-head-sha'
          }
        }
      }
    }
  }
})

// Mock the core module's functions
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn()
}))

// Make sure the GITHUB_TOKEN environment variable is not set
beforeEach(() => {
  jest.clearAllMocks()
  Object.keys(process.env).forEach(function (key) {
    if (key !== 'GITHUB_TOKEN' && key.startsWith('GITHUB_')) {
      delete process.env[key]
    }
  })
  process.env['GITHUB_TOKEN'] = 'my-github-token'
})

describe('reportChecks', () => {
  it('creates a check with the correct parameters', async () => {
    const message: Message = {
      name: 'test-check',
      conclusion: 'success',
      title: 'Test Check',
      summary: ['This is a test check.'],
      message: 'This is a test check.'
    }

    await reportChecks(message)

    expect(core.getInput).toHaveBeenCalledWith('github-token', {required: true})
  })

  it('handles errors', async () => {
    const message: Message = {
      name: 'test-check',
      conclusion: 'success',
      title: 'Test Check',
      summary: ['This is a test check.'],
      message: 'This is a test check.'
    }

    await reportChecks(message)

    expect(core.getInput).toHaveBeenCalledWith('github-token', {required: true})
    expect(github.getOctokit).toHaveBeenCalled()
    expect(core.info).not.toHaveBeenCalled()
  })
})
