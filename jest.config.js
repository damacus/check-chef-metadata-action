module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/\\.claude/'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testEnvironment: 'node',
  // Setup automatic mocking for GitHub Actions modules
  setupFiles: ['<rootDir>/test/setup-jest.js'],
  // Don't transform node_modules except for specific packages
  transformIgnorePatterns: [
    'node_modules/(?!(@actions|@octokit|@aki77))'
  ],
  moduleNameMapper: {
    '^@actions/glob$': '<rootDir>/test/__mocks__/@actions/glob.js',
    '^@actions/github$': '<rootDir>/node_modules/@actions/github/lib/github.js',
    '^@actions/github/lib/(.*)$': '<rootDir>/node_modules/@actions/github/lib/$1',
    '^@actions/core$': '<rootDir>/node_modules/@actions/core/lib/core.js',
    '^@actions/core/lib/(.*)$': '<rootDir>/node_modules/@actions/core/lib/$1',
    '^@octokit/core$': '<rootDir>/node_modules/@octokit/core/dist-node/index.js'
  },
  verbose: true
}
