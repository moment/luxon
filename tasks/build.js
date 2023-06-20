const rollup = require("rollup"),
  { babel } = require("@rollup/plugin-babel"),
  { terser } = require("rollup-plugin-terser"),
  { nodeResolve } = require("@rollup/plugin-node-resolve"),
  rollupCommonJS = require("@rollup/plugin-commonjs"),
  UglifyJS = require("uglify-js"),
  fs = require("fs");

// For some reason, the minifier is currently producing total giberrish, at least for the global build.
// I've disabled it for now, and will simply uglify externally.
const TRUST_MINIFY = false;

function rollupInputOpts(opts) {
  const presetOpts = {
    modules: false,
    loose: true,
  };

  if (opts.target) {
    presetOpts.targets = opts.target;
  }

  const inputOpts = {
    input: opts.src || "./src/luxon.js",
    onwarn: (warning) => {
      // I don't care about these for now
      if (warning.code !== "CIRCULAR_DEPENDENCY") {
        console.warn(`(!) ${warning.message}`);
      }
    },

    plugins: [
      nodeResolve(),
      rollupCommonJS({
        include: "node_modules/**",
      }),
    ],
  };

  if (opts.compile || typeof opts.compile === "undefined") {
    inputOpts.plugins.push(
      babel({
        babelrc: false,
        presets: [["@babel/preset-env", presetOpts]],
        babelHelpers: "bundled",
      })
    );
  }

  if (opts.minify && TRUST_MINIFY) {
    inputOpts.plugins.push(
      terser({
        comments: false,
        mangle: {
          topLevel: !opts.global,
        },
      })
    );
  }

  return inputOpts;
}

function rollupOutputOpts(dest, opts) {
  const outputOpts = {
    file: `build/${dest}/${opts.filename || "luxon.js"}`,
    format: opts.format,
    sourcemap: true,
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
  console.log("Building", dest);
  const promises = [babelAndRollup(dest, opts)];

  if (opts.minify && TRUST_MINIFY) {
    promises.push(
      babelAndRollup(dest, {
        ...opts,
        minify: true,
        filename: "luxon.min.js",
      })
    );
  }

  await Promise.all(promises);

  if (opts.minify && !TRUST_MINIFY) {
    const code = fs.readFileSync(`build/${dest}/luxon.js`, "utf8"),
      ugly = UglifyJS.minify(code, {
        toplevel: !opts.global,
        output: {
          comments: false,
        },
        sourceMap: {
          filename: `build/${dest}/luxon.js`,
        },
      });
    if (ugly.error) {
      console.error("Error uglifying", ugly.error);
    } else {
      fs.writeFileSync(`build/${dest}/luxon.min.js`, ugly.code);
      fs.writeFileSync(`build/${dest}/luxon.min.js.map`, ugly.map);
    }
  }
  console.log("Built", dest);
}

const browsersOld = "last 2 major versions";

async function global() {
  await buildLibrary("global", {
    format: "iife",
    global: true,
    name: "luxon",
    target: browsersOld,
    minify: true,
  });
}

async function amd() {
  await buildLibrary("amd", {
    format: "amd",
    name: "luxon",
    target: browsersOld,
    minify: true,
  });
}

async function umd() {
  await buildLibrary("umd", {
    format: "umd",
    name: "luxon",
    target: browsersOld,
    minify: true,
  });
}

async function node() {
  await buildLibrary("node", { format: "cjs", target: "node 12" });
}

async function cjsBrowser() {
  await buildLibrary("cjs-browser", { format: "cjs", target: browsersOld });
}

async function es6() {
  await buildLibrary("es6", {
    format: "es",
    minify: true,
    compile: false,
  });
}

async function globalEs6() {
  await buildLibrary("global-es6", {
    format: "iife",
    name: "luxon",
    compile: false,
    global: true,
  });
}

async function buildAll() {
  await Promise.all([node(), cjsBrowser(), es6(), amd(), umd(), global(), globalEs6()]);
}

module.exports = {
  buildAll,
  buildNode: node,
  buildGlobal: global,
};
