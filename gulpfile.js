const gulp = require("gulp"),
  rollupStream = require("@rollup/stream"),
  source = require("vinyl-source-stream"),
  sourcemaps = require("gulp-sourcemaps"),
  buffer = require("vinyl-buffer"),
  uglifyjs = require("uglify-js"),
  rename = require("gulp-rename"),
  path = require("path"),
  config = require("./build.config"),
  fs = require("fs"),
  gulpIf = require("gulp-if"),
  composer = require("gulp-uglify/composer"),
  minify = composer(uglifyjs, console);
const exec = async function (task) {
  rollupStream({
    input: config[task].entry,
    onwarn: (warning) => {
      // I don't care about these for now
      if (warning.code !== "CIRCULAR_DEPENDENCY") {
        console.warn(`(!) ${warning.message}`);
      }
    },
    ...config[task].options,
    plugins: config[task].plugins,
  })
    .pipe(source("luxon.js"))
    .pipe(gulp.dest(config[task].output))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      gulpIf(
        config[task].minify,
        minify({
          toplevel: !config[task].global,
          output: {
            comments: false,
          },
        })
      )
    )
    .pipe(sourcemaps.write("."))
    .pipe(
      rename(function (path) {
        if (!path.extname.endsWith(".map") && config[task].minify) {
          path.basename += ".min";
        }
      })
    )
    .pipe(gulp.dest(config[task].output));
};
for (const task in config) {
  gulp.task(task, exec.bind(null, task));
}

gulp.task("build", gulp.parallel(Object.keys(config)));

gulp.task("clean", function (done) {
  fs.stat("./build", (err) => {
    if (!err) {
      fs.rm("./build", { recursive: true, force: true });
    }
    done();
  });
});
