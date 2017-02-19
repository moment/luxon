let babel = require('rollup-plugin-babel'),
    buffer = require('vinyl-buffer'),
    filter = require('gulp-filter'),
    gulpif = require('gulp-if'),
    jest = require('gulp-jest').default,
    lazypipe = require('lazypipe'),
    path = require('path'),
    rename = require('gulp-rename'),
    rollup = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    gulp = require('gulp');

function process(inopts){
  let opts = Object.assign(
    {
      entry: inopts.entry,
      sourceMap: true,
      format: inopts.format,
      plugins: []
    },
    inopts.rollupOpts || {}
  );

  if (inopts.compile || typeof(inopts.compile) == 'undefined'){
    opts.plugins.push(babel({
      babelrc: false,
      presets: [
        ['es2015', {modules: false}]
      ],
      plugins: ['external-helpers']
    }));
  }

  return rollup(opts);
}

function processLib(opts){

  return function(){
    opts.entry = './src/luxon.js';

    let dest = `./dist/${opts.dest || opts.format}`,
        minify = lazypipe()
          .pipe(filter, ['**/*.js'])
          .pipe(uglify)
          .pipe(rename, {extname: '.min.js'})
          .pipe(sourcemaps.write, '.')
          .pipe(gulp.dest, dest);

    return process(opts)
      .pipe(source('luxon.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(dest))
      .pipe(gulpif(opts.mini, minify()));
  };
}

gulp.task('cjs', processLib({
  format: 'cjs',
  rollupOpts: {external: ['intl']}
}));

gulp.task('es6', processLib({
  format: 'es',
  dest: 'es6',
  rollupOpts: {external: ['intl']},
  compile: false
}));

gulp.task('amd', processLib({
  format: 'amd',
  rollupOpts: {moduleName: 'luxon', external: ['intl']},
  mini: true
}));

gulp.task('global-es6', processLib({
  format: 'iife',
  rollupOpts: {moduleName: 'luxon', globals: {intl: 'IntlPolyfill'}, external: ['intl']},
  dest: 'global-es6',
  compile: false
}));

gulp.task('global', processLib({
  format: 'iife',
  rollupOpts: {moduleName: 'luxon', globals: {intl: 'IntlPolyfill'}, external: ['intl']},
  dest: 'global',
  mini: true
}));

gulp.task('build', ['cjs', 'es6', 'amd', 'global', 'global-es6']);

gulp.task('test', function(){
  process({
    entry: 'test/index.test.js',
    format: 'cjs',
    rollupOpts: {
      external: ['luxon'],
      paths: {
        luxon: '../../dist/cjs/luxon.js'
      }
    }
  })
    .pipe(source('index.test.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.compiled-tests/node'))
    .pipe(filter(['.compiled-tests/node/*.js']))
    .pipe(jest()) ;
});

gulp.task('default', ['build']);
