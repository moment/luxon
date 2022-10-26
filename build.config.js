const { nodeResolve } = require("@rollup/plugin-node-resolve"),
  rollupCommonJS = require("@rollup/plugin-commonjs"),
  { babel } = require("@rollup/plugin-babel");
module.exports = {
  node: {
    minify: false,
    entry: "src/luxon.js",
    output: "build/node",
    options: {
      output: {
        format: "cjs",
      },
    },
    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: "node_modules/**",
      }),
    ],
  },
  global: {
    minify: true,
    global: true,
    entry: "src/luxon.js",
    output: "build/global",
    options: {
      output: {
        format: "iife",
        name: "luxon",
      },
    },
    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: "node_modules/**",
      }),
      babel({
        babelrc: false,
        presets: [
          [
            "@babel/preset-env",
            {
              modules: false,
              loose: true,
              targets: "last 2 major versions",
            },
          ],
        ],
        babelHelpers: "bundled",
      }),
    ],
  },
  amd: {
    minify: true,
    entry: "src/luxon.js",
    output: "build/amd",
    options: {
      output: {
        format: "amd",
      },
    },
    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: "node_modules/**",
      }),
    ],
  },
  cjsBrowser: {
    minify: false,
    entry: "src/luxon.js",
    output: "build/cjs-browser",
    options: {
      output: {
        format: "cjs",
      },
    },
    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: "node_modules/**",
      }),
    ],
  },
  es6: {
    minify: false,
    entry: "src/luxon.js",
    output: "build/es6",
    options: {
      output: {
        format: "es",
      },
    },
    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: "node_modules/**",
      }),
    ],
  },
  globalEs6: {
    minify: false,
    entry: "src/luxon.js",
    output: "build/global-es6",
    global: true,
    options: {
      output: {
        format: "iife",
        name: "luxon",
      },
    },
    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: "node_modules/**",
      }),
      babel({
        babelrc: false,
        presets: [
          [
            "@babel/preset-env",
            {
              modules: false,
              loose: true,
            },
          ],
        ],
        babelHelpers: "bundled",
      }),
    ],
  },
};
