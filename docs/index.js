// This file exports a config object to be passed to ESDoc, including what files to add to the manual and what
// options to set when processing the docstrings and computing documentation coverage.

const path = require('path'),
  fs = require('fs');

// This is the table of contents, which exists just to create an ordering.
// If you're adding a doc, all you have to do is add it here.
const manualFiles = [
  'install',
  'tour',
  'intl',
  'zones',
  'calendars',
  'formatting',
  'parsing',
  'math',
  'validity',
  'matrix',
  'moment',
  'why'
].map(d => `./docs/${d}.md`);

// List all the src subdirectories and generate an exclusion string for each.
// This is because we assume all the stuff in subdirs is implementation stuff
// that doesn't need documented.
function excludeNonRoot() {
  return fs
    .readdirSync('./src')
    .filter(name => {
      const fullPath = path.join('./src/', name);
      return fs.lstatSync(fullPath).isDirectory();
    })
    .map(name => `${name}/.*\\.js`);
}

// also exclude these; there's nothing to document
const excludeDumb = ['luxon\\.js', 'luxonFilled\\.js'];

module.exports = {
  source: './src',
  destination: './build/docs',
  excludes: excludeNonRoot().concat(excludeDumb),
  plugins: [
    {
      name: 'esdoc-standard-plugin',
      option: {
        brand: {
          title: 'Luxon'
        },
        manual: {
          globalIndex: true,
          index: './docs/index.md',
          files: manualFiles.concat(['./changelog.md', './contributing.md'])
        }
      }
    },
    // don't consider random unexported functions to be undocumented
    {
      name: 'esdoc-coverage-plugin',
      option: {
        kind: ['class', 'method', 'member', 'get', 'set']
      }
    },
    // customizations to the ESDoc output
    { name: './docs/plugin.js' }
  ]
};
