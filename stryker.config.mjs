// @ts-check
/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
const config = {
  testRunner: 'jest',
  jest: {
    configFile: 'jest.config.js',
  },
  mutate: [
    'src/checkMetadata.ts',
    'src/metadata.ts',
    'src/concurrency.ts',
  ],
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: {
    fileName: 'reports/mutation/mutation.html',
  },
  timeoutMS: 10000,
  timeoutFactor: 2,
  thresholds: {
    high: 80,
    low: 60,
    break: 0,
  },
  disableTypeChecks: true,
  coverageAnalysis: 'perTest',
}

export default config
