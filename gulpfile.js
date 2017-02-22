const babel = require('rollup-plugin-babel');
const buffer = require('vinyl-buffer');
const eslint = require('gulp-eslint');
const filter = require('gulp-filter');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const jest = require('gulp-jest').default;
const lazypipe = require('lazypipe');
const rename = require('gulp-rename');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

function process(inopts) {
  const opts = Object.assign(
    {
      entry: inopts.entry,
      sourceMap: true,
      format: inopts.format,
      plugins: [],
    }, inopts.rollupOpts || {});

  if (inopts.compile || typeof inopts.compile === 'undefined') {
    opts.plugins.push(babel({
      babelrc: false,
      presets: [
        ['es2015', { modules: false }],
      ],
      plugins: ['external-helpers'],
    }));
  }

  return rollup(opts);
}

function processLib(opts) {
  return () => {
    opts.entry = './src/luxon.js';

    const dest = `./dist/${opts.dest || opts.format}`;
    const minify = lazypipe()
            .pipe(filter, ['**/*.js'])
            .pipe(uglify)
            .pipe(rename, { extname: '.min.js' })
            .pipe(sourcemaps.write, '.')
            .pipe(gulp.dest, dest);

    return process(opts)
      .pipe(source('luxon.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest))
      .pipe(gulpif(opts.mini, minify()));
  };
}

gulp.task('cjs', processLib({
  format: 'cjs',
  rollupOpts: { external: ['intl'] },
}));

gulp.task('es6', processLib({
  format: 'es',
  dest: 'es6',
  rollupOpts: { external: ['intl'] },
  compile: false,
}));

gulp.task('amd', processLib({
  format: 'amd',
  rollupOpts: { moduleName: 'luxon', external: ['intl'] },
  mini: true,
}));

gulp.task('global-es6', processLib({
  format: 'iife',
  rollupOpts: { moduleName: 'luxon', globals: { intl: 'IntlPolyfill' }, external: ['intl'] },
  dest: 'global-es6',
  compile: false,
}));

gulp.task('global', processLib({
  format: 'iife',
  rollupOpts: { moduleName: 'luxon', globals: { intl: 'IntlPolyfill' }, external: ['intl'] },
  dest: 'global',
  mini: true,
}));

gulp.task('build', ['cjs', 'es6', 'amd', 'global', 'global-es6']);

gulp.task('test', ['cjs'], () => {
  gulp.src('test').pipe(jest());
});

gulp.task('lint', () =>
          gulp.src(['**/*.js', '!node_modules/**'])
          .pipe(eslint())
          .pipe(eslint.format())
          .pipe(eslint.failAfterError()));

gulp.task('default', ['lint', 'build']);
