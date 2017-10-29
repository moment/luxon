# Contributing to Luxon

## General guidelines

Patches are welcome. Luxon is at this point just a baby and it could use lots of help. But before you dive in...Luxon is one of those tightly-scoped libraries where the default answer to "should this library do X?" is likely "no". **So ask first!** It might save you some time and energy.

Here are some vague notes on Luxon's design philosophy:

 1. We won't accept patches that can't be internationalized using the JS environment's (e.g. the browser's) native capabilities. This means that most convenient humanization features are out of scope.
 1. We try hard to have a clear definition of what Luxon does and doesn't do. With few exceptions, this is not a "do what I mean" library.
 1. Luxon shouldn't contain simple conveniences that bloat the library to save callers a couple lines of code. Write those lines in your own code.
 1. Most of the complexity of JS module loading compatibility is left to the build. If you have a "this can't be loaded in my bespoke JS module loader" problems, this isn't something you should be solving with changes to the `src` directory. If it's a common use case and is possible to generate with Rollup, it can get its own build command.
 1. We prefer documentation clarifications and gotchas to go in the docstrings, not in the guides on the docs page. Obviously, if the guides are wrong, they should be fixed, but we don't want them to turn into troubleshooting pages. On the other hand, making sure the method-level documentation has ample examples and notes is great.

## How to build and test

 1. Clone the repository
 1. Run `npm install`. Wait.
 1. Install gulp using `npm install -g gulp-cli`
 1. Use gulp commands to do developy stuff

## Patch basics

Once you're sure your bugfix or feature makes sense for Luxon, make sure you take these steps:

 1. Be sure to add tests and run them with `gulp test`
 1. Be sure you run `gulp lint!` before you commit. Note this will modify your source files to line up with the style guidelines.
 1. Make sure you add or ESDoc annotations appropriately. You can run `gulp docs` to generate the HTML for them. They land in the `build/docs` directory.
 1. To test in your browser, run `gulp site` and then open `build/demo/global.html`. You can access Luxon classes in the console like `window.luxon.DateTime`.
 1. To test in Node, run `gulp cjs` and then run something like `var DateTime = require('./build/cjs/luxon').DateTime`.

Luxon uses [Husky](https://github.com/typicode/husky) to run the formatter on your code as a pre-commit hook. You should still run `gulp lint!` yourself to catch other issues, but this hook will help prevent you from failing the build with a trivial formatting error.

## Gulp command reference

| Command       | Function                                    |
|---------------|---------------------------------------------|
| `gulp build`  | Build all the distributable files           |
| `gulp test`  | Run the test suite                          |
| `gulp format` | Run the Prettier formatter                  |
| `gulp lint!`  | Run the formatter and the linter            |
| `gulp docs`   | Build the doc pages                         |
| `gulp site`   | Build the Luxon website                     |
| `gulp cjs`    | Build just the CJS distributable            |
| `gulp es6`    | Build just the ES6 distributable            |
| `gulp amd`    | Build just the AMD distributable            |
| `gulp global` | Build just the browser global distributable |
