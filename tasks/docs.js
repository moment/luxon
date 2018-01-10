/* eslint import/no-extraneous-dependencies: off */
import run from './run';

const ESDoc = require('esdoc').default,
  docConfig = require('../docs/index');

function generateDocs() {
  ESDoc.generate(docConfig);
}

run(generateDocs);
