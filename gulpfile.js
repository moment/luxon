const babel = require('rollup-plugin-babel'),
  babili = require('gulp-babili'),
  buffer = require('vinyl-buffer'),
  esdoc = require('gulp-esdoc'),
  eslint = require('gulp-eslint'),
  filter = require('gulp-filter'),
  gulp = require('gulp'),
  jest = require('gulp-jest').default,
  lazypipe = require('lazypipe'),
  prettierOptions = require('./.prettier.js'),
  prettier = require('prettier'),
  rename = require('gulp-rename'),
  rollup = require('rollup-stream'),
  runSequence = require('run-sequence'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps'),
  through = require('through2');

function process(inopts) {
  const opts = Object.assign(
    {
      input: inopts.input,
      sourcemap: true,
      format: inopts.format,
      plugins: []
    },
    inopts.rollupOpts || {}
  );

  if (inopts.compile || typeof inopts.compile === 'undefined') {
    opts.plugins.push(
      babel({
        babelrc: false,
        presets: [['es2015', { modules: false }]],
        plugins: ['external-helpers']
      })
    );
  }

  return rollup(opts);
}

function processLib(opts) {
  return () => {
    opts.input = './src/luxon.js';

    const dest = `./build/${opts.dest || opts.format}`,
      // confession: I have no idea why piping to lazypipe works
      // after dest, but you can't pipe directly so...
      minify = lazypipe()
        .pipe(filter, ['**/*.js'])
        .pipe(babili, { mangle: { keepClassNames: true } })
        .pipe(rename, { extname: '.min.js' })
        .pipe(sourcemaps.write, '.')
        .pipe(gulp.dest, dest);

    return process(opts)
      .pipe(source('luxon.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest))
      .pipe(minify());
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

gulp.task('cjs', processLib({ format: 'cjs' }));

gulp.task(
  'es6',
  processLib({
    format: 'es',
    dest: 'es6',
    compile: false
  })
);

gulp.task(
  'amd',
  processLib({
    format: 'amd',
    rollupOpts: { name: 'luxon' }
  })
);

gulp.task(
  'global-es6',
  processLib({
    format: 'iife',
    rollupOpts: { name: 'luxon' },
    dest: 'global-es6',
    compile: false
  })
);

gulp.task(
  'global',
  processLib({
    format: 'iife',
    rollupOpts: { name: 'luxon' },
    dest: 'global'
  })
);

gulp.task('build', ['cjs', 'es6', 'amd', 'global', 'global-es6']);

gulp.task('test', () => gulp.src('test').pipe(jest()));

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

gulp.task('docs', () =>
  gulp.src('./src').pipe(
    esdoc({
      destination: './build/docs',
      title: 'Luxon',
      manual: {
        globalIndex: true,
        design: ['./docs/install.md', './docs/tour.md'],
        usage: [
          './docs/intl.md',
          './docs/zones.md',
          './docs/calendars.md',
          './docs/formatting.md',
          './docs/parsing.md',
          './docs/math.md',
          './docs/validity.md'
        ],
        faq: ['./docs/matrix.md', './docs/moment.md'],
        changelog: ['./changelog.md']
      },
      styles: ['./site/styles.css'],
      experimentalProposal: {
        classProperties: true,
        objectRestSpread: true
      },
      plugins: [{ name: './site/doc-plugin.js' }]
    })
  )
);

gulp.task('site', () => gulp.src('./site/**').pipe(gulp.dest('./build')));

// build first so the test deps work
gulp.task('simple', cb => runSequence('build', 'lint', 'test', cb));
gulp.task('default', cb => runSequence('format', 'build', 'lint', 'test', 'docs', 'site', cb));
gulp.task('prerelease', cb => runSequence('format', 'build', 'lint', 'docs', 'site', cb));
