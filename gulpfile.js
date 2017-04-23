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
  prettier = require('gulp-prettier'),
  rename = require('gulp-rename'),
  rollup = require('rollup-stream'),
  runSequence = require('run-sequence'),
  source = require('vinyl-source-stream'),
  sourcemaps = require('gulp-sourcemaps');

function process(inopts) {
  const opts = Object.assign(
    { entry: inopts.entry, sourceMap: true, format: inopts.format, plugins: [] },
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
    opts.entry = './src/luxon.js';

    const dest = `./dist/${opts.dest || opts.format}`,
      // confession: I have no idea why piping to lazypipe works
      // after dest, but you can't pipe directly but it does so...
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

gulp.task('cjs', processLib({ format: 'cjs', rollupOpts: { external: ['intl'] } }));

gulp.task(
  'es6',
  processLib({
    format: 'es',
    dest: 'es6',
    rollupOpts: { external: ['intl'] },
    compile: false
  })
);

gulp.task(
  'amd',
  processLib({
    format: 'amd',
    rollupOpts: { moduleName: 'luxon', external: ['intl'] }
  })
);

gulp.task(
  'global-es6',
  processLib({
    format: 'iife',
    rollupOpts: { moduleName: 'luxon', globals: { intl: 'IntlPolyfill' }, external: ['intl'] },
    dest: 'global-es6',
    compile: false
  })
);

gulp.task(
  'global',
  processLib({
    format: 'iife',
    rollupOpts: { moduleName: 'luxon', globals: { intl: 'IntlPolyfill' }, external: ['intl'] },
    dest: 'global'
  })
);

gulp.task('build', ['cjs', 'es6', 'amd', 'global', 'global-es6']);

gulp.task('test', ['cjs'], () => gulp.src('test').pipe(jest()));

const lintable = ['src/**/*.js', 'test/**/*.js', 'gulpfile.js', '.eslintrc.js', '.prettier.js'];

gulp.task('lint', ['format'], () =>
  gulp.src(lintable).pipe(eslint()).pipe(eslint.format()).pipe(eslint.failAfterError()));

gulp.task('format', () =>
  gulp.src(lintable, { base: './' }).pipe(prettier(prettierOptions)).pipe(gulp.dest('./')));

gulp.task('docs', () => gulp.src('./src').pipe(esdoc({ destination: './docs' })));

gulp.task('default', ['lint', 'build', 'test', 'docs']);

gulp.task('default', cb => runSequence('lint', 'build', 'test', 'docs', cb));
