/* eslint no-console: off */
const { buildAll } = require('./build');

buildAll().catch(console.error);
