'use strict';

var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    webpack = require('gulp-webpack'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-ruby-sass'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync'),
    sourcemaps = require('gulp-sourcemaps'),
    protractor = require('gulp-protractor'),
    imagemin = require('gulp-imagemin');

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
  return sass('app/styles/main.scss', { sourcemap: true })
    .on('error', function (err) {
      console.error('Error!', err.message);
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/dist/styles'))
    .pipe(browserSync.reload({stream:true}));
});

// Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('build/dist/images/'));
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

// Default Task
gulp.task('default', ['serve'], function(callback) {
  runSequence(
    ['deps','webpack','html','sass','images'],
    'depsUglify',
    callback);

  // Deps
  gulp.watch(dependencies, function () {
    runSequence('deps', 'depsUglify', browserSync.reload);
  });

  // Webpack
  gulp.watch(['app/scripts/**/*.js', 'app/views/**/*.jade'],
    ['webpack', browserSync.reload]);

  // Htmls
  gulp.watch('app/*.html', ['html', browserSync.reload]);

  // Styles
  gulp.watch('app/styles/**/*.scss', ['sass']);

  // Images
  gulp.watch('app/images/**/*', ['images']);
});
