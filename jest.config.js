module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
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
    '^@actions/glob$': '<rootDir>/test/__mocks__/@actions/glob.js'
  },
  verbose: true
}
