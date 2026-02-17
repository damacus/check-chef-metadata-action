import * as core from '@actions/core'
import * as github from '@actions/github'
import replaceComment, {deleteComment} from '@aki77/actions-replace-comment'
import {reportPR} from '../src/reportPR'
import {Message} from '../src/messageInterface'

describe('reportPR', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(github.context as any).issue = {number: 123}
    ;(github.context as any).job = 'validate'
  })

  it('deletes comment when all checks pass', async () => {
    const messages: Message[] = [
      {
        name: 'test-cookbook',
        conclusion: 'success',
        title: 'Test Check',
        summary: ['All good'],
        message: 'All good'
      }
    ]

    await reportPR(messages)

    expect(deleteComment).toHaveBeenCalledWith(
      expect.objectContaining({
        body: 'Metadata summary [validate]',
        startsWith: true
      })
    )
    expect(replaceComment).not.toHaveBeenCalled()
  })

  it('creates/replaces comment when there are failures', async () => {
    const messages: Message[] = [
      {
        name: 'test-cookbook',
        conclusion: 'failure',
        title: 'Test Check',
        summary: ['Failure detected'],
        message: 'Failure detected',
        errors: [
          {
            field: 'maintainer',
            expected: 'Sous Chefs',
            actual: 'Wrong',
            line: 5
          }
        ]
      }
    ]

    await reportPR(messages)

    expect(replaceComment).toHaveBeenCalledTimes(1)
    const call = (replaceComment as jest.Mock).mock.calls[0][0]
    expect(call.body).toMatch(/^Metadata summary \[validate\]/)
    expect(call.body).toContain('# Metadata Validation Results')
  })

  it('skips when no PR ID', async () => {
    ;(github.context as any).issue = {number: 0}

    const messages: Message[] = [
      {
        name: 'test-cookbook',
        conclusion: 'failure',
        title: 'Test Check',
        summary: ['Failure'],
        message: 'Failure'
      }
    ]

    await reportPR(messages)

    expect(replaceComment).not.toHaveBeenCalled()
    expect(deleteComment).not.toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith(
      'No PR ID found, skipping PR comment'
    )
  })

  it('handles replaceComment error gracefully', async () => {
    ;(replaceComment as jest.Mock).mockRejectedValueOnce(
      new Error('API error')
    )

    const messages: Message[] = [
      {
        name: 'test-cookbook',
        conclusion: 'failure',
        title: 'Test Check',
        summary: ['Failure'],
        message: 'Failure',
        errors: [
          {field: 'license', expected: 'Apache-2.0', actual: 'MIT', line: 3}
        ]
      }
    ]

    await expect(reportPR(messages)).resolves.not.toThrow()
    expect(core.error).toHaveBeenCalledWith(
      expect.stringContaining('Error in replaceComment')
    )
  })

  it('uses job name as identifier', async () => {
    ;(github.context as any).job = 'my-custom-job'

    const messages: Message[] = [
      {
        name: 'test-cookbook',
        conclusion: 'failure',
        title: 'Test Check',
        summary: ['Failure'],
        message: 'Failure',
        errors: [
          {field: 'maintainer', expected: 'Sous Chefs', actual: 'Wrong'}
        ]
      }
    ]

    await reportPR(messages)

    const call = (replaceComment as jest.Mock).mock.calls[0][0]
    expect(call.body).toContain('Metadata summary [my-custom-job]')
  })

  it('extracts cookbook name from separator', async () => {
    const messages: Message[] = [
      {
        name: 'Validation - path/to/metadata.rb',
        conclusion: 'failure',
        title: 'Test Check',
        summary: ['Failure'],
        message: 'Failure',
        errors: [
          {field: 'maintainer', expected: 'Sous Chefs', actual: 'Wrong'}
        ]
      }
    ]

    await reportPR(messages)

    // markdownTable is mocked, so check the call args to markdownTable
    const {markdownTable} = require('markdown-table')
    const tableData = (markdownTable as jest.Mock).mock.calls[0][0]
    // Row 0 is header, row 1 is data
    expect(tableData[1][0]).toBe('path/to/metadata.rb')
  })

  it('accepts single Message (non-array)', async () => {
    const message: Message = {
      name: 'test-cookbook',
      conclusion: 'failure',
      title: 'Test Check',
      summary: ['Failure'],
      message: 'Failure',
      errors: [
        {field: 'license', expected: 'Apache-2.0', actual: 'MIT', line: 1}
      ]
    }

    await reportPR(message)

    expect(replaceComment).toHaveBeenCalledTimes(1)
  })
})
