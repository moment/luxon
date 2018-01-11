/* eslint import/no-extraneous-dependencies: off */
const jest = require('jest');

async function test() {
  const opts = {
    collectCoverage: true,
    coverageDirectory: 'build/coverage',
    collectCoverageFrom: ['src/**', '!src/zone.js', '!src/luxonFilled.js'],
    ci: !!process.env.CI
  };

  if (process.env.LIMIT_JEST) {
    opts.maxWorkers = 4;
  }

  await jest.runCLI(opts, ['./test']);
}

test();
