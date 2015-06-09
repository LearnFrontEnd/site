// originally based on https://github.com/vanjacosic/run-wintersmith
//
// 'gulp watch' runs preview mode with a local server and refreshes the browser
// when Markdown or Jade files are modified. Requires Livereload for Chrome.
//
// 'gulp build' builds the site to the default folder.

// Include gulp
var gulp = require('gulp');
var gutil = require('gulp-util');

// Include plugins
var clean = require('gulp-rimraf');
var refresh = require('gulp-livereload');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var runWintersmith = require('run-wintersmith');
var cssnext = require('gulp-cssnext')
var iconify = require('gulp-iconify')
var lr = require('tiny-lr');
var server = lr();

//
// Directories
//
var BUILD_DIR = 'build';
var CONTENT_DIR = 'contents';
var TEMPLATES_DIR = 'templates';

//
// Helper task - Cleans everything in build dir
//
gulp.task('clean', function() {
    return gulp.src(BUILD_DIR, { read: false }).pipe(clean());
});

//
// Build task
//
gulp.task('build', ['clean'], function(cb) {
  // Tell Wintersmith to build
  runWintersmith.build(function(){
    // Log on successful build
    gutil.log('Wintersmith has finished building!');

    // Tell gulp task has finished
    cb();
  });
});

//
// CSS task
//
gulp.task("stylesheets", function() {
  gulp.src("contents/css/src/index.css")
    .pipe(cssnext({
      compress: true
    }))
    .pipe(gulp.dest("contents/css"))
    .pipe(browserSync.stream());
});

gulp.task('icons', function() {
    iconify({
        src: './contents/img/icons/*.svg'
    });
});

//
// Preview task
//
gulp.task('preview', function() {
  // Tell Wintersmith to run in preview mode
  runWintersmith.preview();
});

gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "http://localhost:3000"
    });
});

//
// Watch task
//
gulp.task('watch', ['stylesheets', 'preview', 'browser-sync'], function(){
  function reportChange(e) {
    gutil.log(gutil.template('File <%= file %> was <%= type %>, rebuilding...', {
      file: gutil.colors.cyan(e.path),
      type: e.type
    }));
  }

  // Watch Jade template files
  gulp.watch(TEMPLATES_DIR + '/**/*.jade')
  .on('change', reportChange);

  // Watch Markdown files
  gulp.watch(CONTENT_DIR + '/**/*.md')
  .on('change', reportChange);

  // Watch CSS files
  gulp.watch(CONTENT_DIR + '/css/src/**', ['stylesheets'])
  .on('change', reportChange);
});
