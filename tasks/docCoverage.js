/* eslint import/no-extraneous-dependencies: off */
/* eslint no-console: off */
import fs from 'fs-extra';

fs
  .readJson('build/docs/coverage.json')
  .then(parsed => {
    if (parsed.coverage !== '100%') {
      console.error('Doc coverage not 100%');
      process.exit(1);
    }
  })
  .catch(() => {
    console.error("Couldn't read doc coverage file");
    process.exit(1);
  });
