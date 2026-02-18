import * as core from '@actions/core'
import * as github from '@actions/github'
import {Message} from '../src/messageInterface'
import {reportChecks} from '../src/reportChecks'

describe('reportChecks', () => {
  let mockChecksCreate: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockChecksCreate = jest.fn().mockResolvedValue({data: {id: 'check-id'}})

    // Ensure pull_request context is set for tests
    github.context.payload.pull_request = {
      head: {sha: 'test-sha'},
      number: 123
    } as any
    ;(github.getOctokit as jest.Mock).mockReturnValue({
      rest: {
        checks: {
          create: mockChecksCreate
        }
      }
    })
  })

  it('creates a check with the correct parameters', async () => {
    const message: Message = {
      name: 'test-cookbook',
      conclusion: 'success',
      title: 'Test Check',
      summary: ['This is a test check.'],
      message: 'This is a test check.'
    }

    await reportChecks(message)

    expect(core.getInput).toHaveBeenCalledWith('github-token', {required: true})
    expect(github.getOctokit).toHaveBeenCalled()
  })

  it('uses pull_request head sha for check run', async () => {
    const message: Message = {
      name: 'test-cookbook',
      conclusion: 'success',
      title: 'Test Check',
      summary: ['All good'],
      message: 'All good'
    }

    await reportChecks(message)

    expect(mockChecksCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        head_sha: 'test-sha'
      })
    )
  })

  it('creates annotations with correct format when errors exist', async () => {
    const message: Message = {
      name: 'cookbooks/java/metadata.rb',
      conclusion: 'failure',
      title: 'Validation failed',
      summary: ["maintainer: expected 'Sous Chefs', got 'Bob'"],
      message: "Metadata doesn't match",
      errors: [
        {
          field: 'maintainer',
          expected: 'Sous Chefs',
          actual: 'Bob',
          line: 3,
          path: 'cookbooks/java/metadata.rb',
          level: 'failure'
        }
      ]
    }

    await reportChecks(message)

    const callArgs = mockChecksCreate.mock.calls[0][0]
    expect(callArgs.conclusion).toBe('failure')
    expect(callArgs.output.annotations).toEqual([
      {
        path: 'cookbooks/java/metadata.rb',
        start_line: 3,
        end_line: 3,
        annotation_level: 'failure',
        message: "maintainer: expected 'Sous Chefs', got 'Bob'",
        title: 'Metadata/Maintainer'
      }
    ])
  })

  it('uses warning annotation_level for warning-level errors', async () => {
    const message: Message = {
      name: 'metadata.rb',
      conclusion: 'failure',
      title: 'Validation failed',
      summary: ['source_url is not accessible'],
      message: "Metadata doesn't match",
      errors: [
        {
          field: 'source_url',
          expected: 'HTTP 200',
          actual: 'UNREACHABLE',
          line: 5,
          path: 'metadata.rb',
          level: 'warning'
        }
      ]
    }

    await reportChecks(message)

    const callArgs = mockChecksCreate.mock.calls[0][0]
    expect(callArgs.output.annotations).toEqual([
      expect.objectContaining({
        annotation_level: 'warning',
        path: 'metadata.rb',
        start_line: 5,
        end_line: 5
      })
    ])
  })

  it('defaults annotation_level to failure when level is not set', async () => {
    const message: Message = {
      name: 'metadata.rb',
      conclusion: 'failure',
      title: 'Validation failed',
      summary: ['field mismatch'],
      message: "Metadata doesn't match",
      errors: [
        {
          field: 'license',
          expected: 'Apache-2.0',
          actual: 'MIT',
          line: 7,
          path: 'metadata.rb'
          // level intentionally omitted
        }
      ]
    }

    await reportChecks(message)

    const callArgs = mockChecksCreate.mock.calls[0][0]
    expect(callArgs.output.annotations[0].annotation_level).toBe('failure')
  })

  it('falls back to line 1 when line is undefined', async () => {
    const message: Message = {
      name: 'metadata.rb',
      conclusion: 'failure',
      title: 'Validation failed',
      summary: ['field missing'],
      message: "Metadata doesn't match",
      errors: [
        {
          field: 'version',
          expected: 'Field to exist',
          actual: 'MISSING',
          line: undefined,
          path: 'metadata.rb',
          level: 'failure'
        }
      ]
    }

    await reportChecks(message)

    const callArgs = mockChecksCreate.mock.calls[0][0]
    expect(callArgs.output.annotations[0].start_line).toBe(1)
    expect(callArgs.output.annotations[0].end_line).toBe(1)
  })

  it('aggregates errors from multiple cookbooks', async () => {
    const messages: Message[] = [
      {
        name: 'cookbooks/java/metadata.rb',
        conclusion: 'failure',
        title: 'Validation failed',
        summary: ['maintainer mismatch'],
        message: "Metadata doesn't match",
        errors: [
          {
            field: 'maintainer',
            expected: 'Sous Chefs',
            actual: 'Bob',
            line: 3,
            path: 'cookbooks/java/metadata.rb',
            level: 'failure'
          }
        ]
      },
      {
        name: 'cookbooks/redis/metadata.rb',
        conclusion: 'failure',
        title: 'Validation failed',
        summary: ['license mismatch'],
        message: "Metadata doesn't match",
        errors: [
          {
            field: 'license',
            expected: 'Apache-2.0',
            actual: 'MIT',
            line: 5,
            path: 'cookbooks/redis/metadata.rb',
            level: 'failure'
          }
        ]
      }
    ]

    await reportChecks(messages)

    const callArgs = mockChecksCreate.mock.calls[0][0]
    expect(callArgs.output.annotations).toHaveLength(2)
    expect(callArgs.output.annotations[0].path).toBe(
      'cookbooks/java/metadata.rb'
    )
    expect(callArgs.output.annotations[1].path).toBe(
      'cookbooks/redis/metadata.rb'
    )
    expect(callArgs.conclusion).toBe('failure')
  })

  it('caps annotations at 50', async () => {
    const errors = Array.from({length: 60}, (_, i) => ({
      field: `field_${i}`,
      expected: 'expected',
      actual: 'actual',
      line: i + 1,
      path: 'metadata.rb',
      level: 'failure' as const
    }))

    const message: Message = {
      name: 'metadata.rb',
      conclusion: 'failure',
      title: 'Validation failed',
      summary: ['many errors'],
      message: "Metadata doesn't match",
      errors
    }

    await reportChecks(message)

    const callArgs = mockChecksCreate.mock.calls[0][0]
    expect(callArgs.output.annotations).toHaveLength(50)
  })

  it('does not include annotations when there are no errors', async () => {
    const message: Message = {
      name: 'metadata.rb',
      conclusion: 'success',
      title: 'Metadata validated',
      summary: ['Metadata validated'],
      message: 'Metadata matches',
      errors: []
    }

    await reportChecks(message)

    const callArgs = mockChecksCreate.mock.calls[0][0]
    expect(callArgs.output.annotations).toBeUndefined()
    expect(callArgs.conclusion).toBe('success')
  })

  it('handles errors', async () => {
    const message: Message = {
      name: 'test-cookbook',
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
