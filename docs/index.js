// This is the table of contents, which exists just to create an ordering.
// If you're adding a doc, all you have to do is add it here.

const path = require('path'),
  fs = require('fs');

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
];

function xform(docs) {
  // paths are relative to root
  return docs.map(d => `./docs/${d}.md`);
}

function excludeNonRoot() {
  return fs
    .readdirSync('./src')
    .filter(name => {
      const fullPath = path.join('./src/', name);
      return fs.lstatSync(fullPath).isDirectory();
    })
    .map(name => `${name}/.*\\.js`);
}

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
          files: xform(manualFiles).concat(['./changelog.md', './contributing.md'])
        }
      }
    },
    {
      name: 'esdoc-coverage-plugin',
      option: {
        kind: ['class', 'method', 'member', 'get', 'set']
      }
    },
    { name: './docs/plugin.js' }
  ]
};
