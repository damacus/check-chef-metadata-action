import * as core from '@actions/core'
import * as github from '@actions/github'
import {Message} from '../src/messageInterface'
import {reportChecks} from '../src/reportChecks'

describe('reportChecks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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
    expect(github.getOctokit).toHaveBeenCalled()
  })

  it('handles errors', async () => {
    const message: Message = {
      name: 'test-check',
      conclusion: 'success',
      title: 'Test Check',
      summary: ['This is a test check.'],
      message: 'This is a test check.'
    }

    // Force error in getOctokit
    ;(github.getOctokit as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Octokit error')
    })

    await reportChecks(message)

    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create check run: Octokit error')
    )
  })
})
