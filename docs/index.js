// This is the table of contents. Each document goes in one of these categories.
// If you're adding a doc, all you have to do is add it to one of these.
const basics = ['install', 'tour'],
  guide = ['intl', 'zones', 'calendars', 'formatting', 'parsing', 'math', 'validity'],
  faq = ['matrix', 'moment', 'why'];

function xform(docs) {
  // paths are relative to root
  return docs.map(d => `./docs/${d}.md`);
}

module.exports = {
  globalIndex: true,
  // these names are hardcoded by ESDoc and we are slightly abusing them
  design: xform(basics),
  usage: xform(guide),
  faq: xform(faq),
  changelog: ['./changelog.md']
};
