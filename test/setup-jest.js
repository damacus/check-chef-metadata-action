// Mock for @actions/github
jest.mock('@actions/github', () => {
  return {
    context: {
      repo: {
        owner: 'sous-chefs',
        repo: 'java'
      },
      payload: {
        pull_request: {
          number: 123,
          head: { sha: 'abc123' }
        }
      }
    },
    getOctokit: jest.fn(() => ({
      rest: {
        checks: {
          create: jest.fn().mockResolvedValue({ data: { id: 'check-id' } }),
          update: jest.fn().mockResolvedValue({ data: { id: 'check-id' } })
        },
        issues: {
          createComment: jest.fn().mockResolvedValue({ data: { id: 'comment-id' } }),
          listComments: jest.fn().mockResolvedValue({ data: [] })
        }
      }
    }))
  }
})

// Mock for @actions/core
jest.mock('@actions/core', () => {
  return {
    getInput: jest.fn().mockImplementation(name => {
      const key = `INPUT_${name.toUpperCase().replace(/ /g, '_')}`
      const val = process.env[key]
      if (val) return val

      const defaults = {
        'github-token': 'mock-token',
        'chef-cookbook-path': './test/fixtures',
        'maintainer': 'Sous Chefs',
        'maintainer_email': 'help@sous-chefs.org',
        'license': 'Apache-2.0'
      }
      return defaults[name] || ''
    }),
    setFailed: jest.fn(),
    setOutput: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn()
  }
})

// Mock for @aki77/actions-replace-comment
jest.mock('@aki77/actions-replace-comment', () => {
  return {
    __esModule: true,
    default: jest.fn().mockResolvedValue({ id: 'mock-comment-id' }),
    deleteComment: jest.fn().mockResolvedValue(true)
  }
})

// Mock for markdown-table
jest.mock('markdown-table', () => {
  return {
    markdownTable: jest.fn(data => 'mocked table')
  }
})
