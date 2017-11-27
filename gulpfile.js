const babel = require('rollup-plugin-babel'),
  buffer = require('vinyl-buffer'),
  coveralls = require('gulp-coveralls'),
  docConfig = require('./docs/index'),
  esdoc = require('gulp-esdoc'),
  eslint = require('gulp-eslint'),
  filter = require('gulp-filter'),
  gulp = require('gulp'),
  jest = require('gulp-jest').default,
  lazypipe = require('lazypipe'),
  minify = require('gulp-babel-minify'),
  prettierOptions = require('./.prettier'),
  prettier = require('prettier'),
  process = require('process'),
  rename = require('gulp-rename'),
  rollup = require('rollup-stream'),
  rollupNode = require('rollup-plugin-node-resolve'),
  rollupCommonJS = require('rollup-plugin-commonjs'),
  runSequence = require('run-sequence'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  through = require('through2'),
  util = require('gulp-util');

function rollupLib(inopts) {
  const opts = Object.assign(
      {
        input: inopts.src || './src/luxon.js',
        sourcemap: true,
        format: inopts.format,
        plugins: [
          rollupNode(),
          rollupCommonJS({
            include: 'node_modules/**'
          })
        ]
      },
      inopts.rollupOpts || {}
    ),
    presetOpts = {
      modules: false
    };

  if (inopts.target) {
    presetOpts.targets = [inopts.target];
  }

  if (inopts.compile || typeof inopts.compile === 'undefined') {
    opts.plugins.push(
      babel({
        babelrc: false,
        presets: [['env', presetOpts]],
        plugins: ['external-helpers']
      })
    );
  }
  return rollup(opts);
}

function processLib(dest, opts) {
  return () => {
    const fullDest = `./build/${dest}`,
      // confession: I have no idea why piping to lazypipe works
      // after dest, but you can't pipe directly so...
      minifyLib = lazypipe()
        .pipe(filter, ['**/*.js'])
        .pipe(minify, { mangle: { keepClassNames: true } })
        .pipe(rename, { extname: '.min.js' })
        .pipe(sourcemaps.write, '.')
        .pipe(gulp.dest, fullDest);

    return rollupLib(opts)
      .pipe(source(opts.src || './src/luxon.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('.'))
      .pipe(rename({ basename: 'luxon', dirname: '' }))
      .pipe(gulp.dest(fullDest))
      .pipe(minifyLib());
  };
}

function prettify(opts) {
  return through.obj((file, _, callback) => {
    const str = file.contents.toString(),
      data = prettier.format(str, opts);
    file.contents = Buffer.from(data);
    callback(null, file);
  });
}

function checkForDocCoverage() {
  // eslint-disable-next-line func-names
  return through.obj(function(file, enc, cb) {
    const content = file.contents.toString(enc),
      parsed = JSON.parse(content);
    if (parsed.coverage === '100%') {
      this.push(file);
      cb();
    } else {
      this.emit(
        'error',
        new util.PluginError('check-for-coverage', { message: 'Doc coverage not 100%' })
      );
      this.emit('end');
    }
  });
}

function test(includeCoverage) {
  const opts = {
    collectCoverage: includeCoverage,
    coverageDirectory: 'build/coverage',
    collectCoverageFrom: ['src/**', '!src/zone.js', '!src/luxonFilled.js'],
    ci: !!process.env.CI
  };

  if (process.env.LIMIT_JEST) {
    opts.maxWorkers = 4;
  }

  return gulp.src('test').pipe(jest(opts));
}

const browsersOld = { browsers: 'last 2 major versions' };

gulp.task(
  'global',
  processLib('global', {
    format: 'iife',
    rollupOpts: { name: 'luxon' },
    target: browsersOld
  })
);

gulp.task(
  'global-filled',
  processLib('global-filled', {
    format: 'iife',
    rollupOpts: { name: 'luxon' },
    target: browsersOld,
    src: './src/luxonFilled.js'
  })
);

gulp.task(
  'amd',
  processLib('amd', {
    format: 'amd',
    rollupOpts: { name: 'luxon' },
    target: browsersOld
  })
);

gulp.task('node', processLib('node', { format: 'cjs', target: 'node >= 6' }));

gulp.task('cjs-browser', processLib('cjs-browser', { format: 'cjs', browsersOld }));

gulp.task(
  'es6',
  processLib('es6', {
    format: 'es',
    compile: false
  })
);

gulp.task(
  'global-es6',
  processLib('global-es6', {
    format: 'iife',
    rollupOpts: { name: 'luxon' },
    compile: false
  })
);

gulp.task('build', ['node', 'cjs-browser', 'es6', 'amd', 'global', 'global-es6', 'global-filled']);

gulp.task('test-with-coverage', () => test(true));
gulp.task('test', () => test(false));

const lintable = ['src/**/*.js', 'test/**/*.js', 'gulpfile.js', '.eslintrc.js', '.prettier.js'],
  doLint = () =>
    gulp
      .src(lintable)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());

gulp.task('lint!', ['format'], doLint);
gulp.task('lint', doLint);

gulp.task('format', () =>
  gulp
    .src(lintable, { base: './' })
    .pipe(prettify(prettierOptions))
    .pipe(gulp.dest('./'))
);

gulp.task('generate-docs', () => gulp.src('./src').pipe(esdoc(docConfig)));

gulp.task('check-doc-coverage', () =>
  gulp.src('build/docs/coverage.json').pipe(checkForDocCoverage())
);

gulp.task('docs', cb => runSequence('generate-docs', 'check-doc-coverage', cb));

gulp.task('coveralls', () => gulp.src('build/coverage/lcov.info').pipe(coveralls()));

gulp.task('site', () => gulp.src('./site/**').pipe(gulp.dest('./build')));

gulp.task('ci', cb => runSequence('node', 'lint', 'test-with-coverage', 'docs', cb));

gulp.task('default', cb =>
  runSequence('format', 'build', 'lint', 'test', 'coveralls', 'docs', 'site', cb)
);

gulp.task('prerelease', cb => runSequence('format', 'build', 'lint', 'docs', 'site', cb));
