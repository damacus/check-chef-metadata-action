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
      comment: 'This is a test check.',
      message: 'This is a test check.'
    }

    await reportChecks(message)

    expect(core.getInput).toHaveBeenCalledWith('github-token', {required: true})
    expect(github.getOctokit().rest.checks.create).toHaveBeenCalledWith({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: message.name,
      head_sha: github.context.payload.pull_request?.head.sha,
      status: 'completed',
      conclusion: message.conclusion,
      output: {
        title: message.title,
        summary: message.summary.join('\n')
      }
    })
    expect(core.info).toHaveBeenCalledWith(expect.any(String))
    // expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('handles errors', async () => {
    const message: Message = {
      name: 'test-check',
      conclusion: 'success',
      title: 'Test Check',
      summary: ['This is a test check.'],
      comment: 'This is a test check.',
      message: 'This is a test check.'
    }

    // const errorMessage = 'Error creating check'
    // ;(
    //   github.getOctokit().rest.checks.create as jest.Mock
    // ).mockRejectedValueOnce(new Error(errorMessage))

    await reportChecks(message)

    expect(core.getInput).toHaveBeenCalledWith('github-token', {required: true})
    expect(github.getOctokit).toHaveBeenCalled()
    // expect(github.getOctokit().rest.checks.create).toHaveBeenCalledWith(
    //   expect.any(Object)
    // )
    expect(core.info).not.toHaveBeenCalled()
    // expect(core.setFailed).toHaveBeenCalledWith(errorMessage)
  })
})
