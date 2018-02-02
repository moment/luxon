/* eslint import/no-extraneous-dependencies: off */
/* eslint no-console: off */
const rollup = require('rollup'),
  rollupBabel = require('rollup-plugin-babel'),
  rollupMinify = require('rollup-plugin-babel-minify'),
  rollupNode = require('rollup-plugin-node-resolve'),
  rollupCommonJS = require('rollup-plugin-commonjs');

function rollupInputOpts(opts) {
  const presetOpts = {
    modules: false,
    loose: true
  };

  if (opts.target) {
    presetOpts.targets = [opts.target];
  }

  const inputOpts = {
    input: opts.src || './src/luxon.js',
    plugins: [
      rollupNode(),
      rollupCommonJS({
        include: 'node_modules/**'
      })
    ]
  };

  if (opts.compile || typeof opts.compile === 'undefined') {
    inputOpts.plugins.push(
      rollupBabel({
        babelrc: false,
        presets: [['env', presetOpts]],
        plugins: ['external-helpers']
      })
    );
  }

  if (opts.minify) {
    inputOpts.plugins.push(
      rollupMinify({
        comments: false,
        mangle: {
          topLevel: true
        }
      })
    );
  }

  return inputOpts;
}

function rollupOutputOpts(dest, opts) {
  const outputOpts = {
    file: `build/${dest}/${opts.filename || 'luxon.js'}`,
    format: opts.format,
    sourcemap: true
  };

  if (opts.name) {
    outputOpts.name = opts.name;
  }

  return outputOpts;
}

async function babelAndRollup(dest, opts) {
  const inputOpts = rollupInputOpts(opts),
    outputOpts = rollupOutputOpts(dest, opts),
    bundle = await rollup.rollup(inputOpts);
  await bundle.write(outputOpts);
}

async function buildLibrary(dest, opts) {
  console.log('Building', dest);
  await Promise.all([
    babelAndRollup(dest, opts),
    babelAndRollup(
      dest,
      Object.assign({}, opts, {
        minify: true,
        filename: 'luxon.min.js'
      })
    )
  ]);
  console.log('Built', dest);
}

const browsersOld = { browsers: 'last 2 major versions' };

async function global() {
  await buildLibrary('global', {
    format: 'iife',
    name: 'luxon',
    target: browsersOld
  });
}

async function globalFilled() {
  await buildLibrary('global-filled', {
    format: 'iife',
    name: 'luxon',
    target: browsersOld,
    src: './src/luxonFilled.js'
  });
}

async function amd() {
  await buildLibrary('amd', {
    format: 'amd',
    name: 'luxon',
    target: browsersOld
  });
}

async function amdFilled() {
  await buildLibrary('amd-filled', {
    format: 'amd',
    name: 'luxon',
    target: browsersOld,
    src: './src/luxonFilled.js'
  });
}

async function node() {
  await buildLibrary('node', { format: 'cjs', target: 'node >= 6' });
}

async function cjsBrowser() {
  await buildLibrary('cjs-browser', { format: 'cjs', browsersOld });
}

async function es6() {
  await buildLibrary('es6', {
    format: 'es',
    compile: false
  });
}

async function globalEs6() {
  await buildLibrary('global-es6', {
    format: 'iife',
    name: 'luxon',
    compile: false
  });
}

async function build() {
  await Promise.all([
    node(),
    cjsBrowser(),
    es6(),
    amd(),
    amdFilled(),
    global(),
    globalEs6(),
    globalFilled()
  ]);
}

build().then(
  () => {},
  err => {
    console.error(err);
  }
);
