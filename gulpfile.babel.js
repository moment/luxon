let gulp = require('gulp'),
    gulpif = require('gulp-if'),
    lazypipe = require('lazypipe'),
    rollup = require('gulp-rollup'),
    uglify = require('gulp-uglify'),
    babel = require('rollup-plugin-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    mocha = require('gulp-mocha'),
    path = require('path');

function preprocess(inopts){

  let opts = Object.assign(
    {
      sourceMap: true,
      format: inopts.format,
      plugins: []
    },
    inopts.rollupOpts || {}
  );

  if (inopts.compile || typeof(inopts.compile) == 'undefined'){
    opts.plugins.push(babel());
  }

  return lazypipe().pipe(rollup, opts)();
}

function processSrc(opts) {
  let dest = `dist/${opts.dest}`;
  return lazypipe()
    .pipe(gulp.dest, dest)
    .pipe(() => gulpif(!opts.nougly,
                       uglify(),
                       rename({extname: '.min.js'}),
                       gulp.dest(dest)))();
}

function resolveLib(opts = {}){
  return {
    //It's sort of annoying that we compile the whole library into the tests.
    //Ideally, there would be a Rollup option to replace it with a customized
    //external import, so I could point it at dist/cjs/luxon.js
    resolveId: (importee) =>
      importee === 'luxon' ? path.resolve(__dirname, 'src/luxon.js') : null
  };
}


function src(){
  return gulp.src('src/luxon.js');
}

gulp.task('cjs', () =>
          src()
          .pipe(preprocess({format: 'cjs'}))
          .pipe(processSrc({dest: 'cjs', nougly: true})));

gulp.task('es6', () =>
          src()
          .pipe(preprocess({format: 'es6', compile: false}))
          .pipe(processSrc({dest: 'es6', nougly: true})));

gulp.task('amd', () =>
          src()
          .pipe(preprocess({format: 'amd'}))
          .pipe(processSrc({dest: 'amd'})));

gulp.task('global-es6', () =>
          src()
          .pipe(preprocess({format: 'iife', rollupOpts: {moduleName: 'luxon'}, compile: false}))
          .pipe(processSrc({dest: 'global-es6', nougly: true})));

gulp.task('global', () =>
          src()
          .pipe(preprocess({format: 'iife', rollupOpts: {moduleName: 'luxon'}}))
          .pipe(processSrc({dest: 'global', nougly: true})));

gulp.task('build', ['cjs', 'es6', 'amd', 'global', 'global-es6']);

gulp.task('test', ['buildNodeTest'], () =>
  gulp
    .src('.compiled-tests/node/index.spec.js')
    .pipe(mocha({reporter: 'spec'})));

//sort of annoying: you can't stream a built file to the mocha wrapper,
//so build it to a temp dir and then run it
gulp.task('buildNodeTest', () =>
  gulp
    .src('test/index.spec.js')
    .pipe(preprocess({
      format: 'cjs',
      compile: true,
      rollupOpts: {
        external: ['chai'],
        plugins: [resolveLib()]
      }
    }))
    .pipe(gulp.dest('.compiled-tests/node')));

gulp.task('browserTest', ['global'], () =>
  gulp
    .src('test/index.spec.js')
    .pipe(preprocess({
      format: 'iife',
      rollupOpts: {
        external: ['chai']
      }
    }))
    .pipe(gulp.dest('.compiled-tests/browser')));

//todo - don't kerplode on build failures
gulp.task('watch', ['build'], () => gulp.watch('src/**/*.js', ['build']));

gulp.task('default', ['build']);
