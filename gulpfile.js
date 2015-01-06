'use strict';

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    webpack = require('gulp-webpack'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload'),
    browserSync = require('browser-sync'),
    protractor = require('gulp-protractor');

var dependencies = [
  'bower_components/angular/angular.js',
  'bower_components/angular-route/angular-route.js',
  'bower_components/jquery/dist/jquery.js',
  'bower_components/bootstrap-sass/dist/js/bootstrap.js'
];

// Dependencies
gulp.task('deps', function() {
  return gulp.src(dependencies)
    .pipe(concat('deps.js'))
    .pipe(gulp.dest('build/dist/scripts/'))
});

gulp.task('depsUglify', function() {
  return gulp.src('build/dist/scripts/deps.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/dist/scripts/'))
});

// Webpack
gulp.task('webpack', function() {
  return gulp.src('app/scripts/entry.js')
    .pipe(webpack({
      module: {
        loaders: [
          { test: /\.jade$/, loader: "jade-loader" }
        ]
      },
      output: {
        filename: "frontendboilerplate.js"
      }
    }))
    .pipe(gulp.dest('build/dist/scripts/'));
});

// Html
gulp.task('html', function() {
  return gulp.src('app/index.html')
    .pipe(gulp.dest('build/dist/'))
});

// Sass
gulp.task('sass', function () {
  gulp.src('app/styles/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('build/dist/styles'));
});

// Static server
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: "build/dist"
    }
  });
});

// e2e tests
gulp.task('webdriver-update', protractor.webdriver_update);
gulp.task('protractor', ['webdriver-update'], function () {
  gulp.src(['test/e2e/**/*.js'])
    .pipe(protractor.protractor({
      configFile: "test/protractor.config.js",
      args: ['--baseUrl', 'http://localhost:3000']
    }))
    .on('error', function (e) {
      throw e
    });
});

// Watch
gulp.task('watch', function () {
  livereload.listen();

  // Deps
  watch(dependencies, function () {
    runSequence('deps', 'depsUglify');
    livereload.changed();
  });

  // Webpack
  watch(['app/scripts/**/*.js', 'app/views/**/*.jade'], function () {
    gulp.start('webpack', function(){
      livereload.changed();
    });
  });

  // Styles
  watch('app/styles/**/*.scss', function () {
    gulp.start('sass', function(){
      // TODO don't ask..
      setTimeout(function(){
        livereload.changed();
      }, 1000)
    });
  });

  // Htmls
  watch('app/*.html', function () {
    gulp.start('html', function(){
      livereload.changed();
    });
  });
});

// Default Task
gulp.task('default', function(callback) {
  runSequence(
    ['deps','webpack','html','sass'],
    'depsUglify',
    callback);
});
