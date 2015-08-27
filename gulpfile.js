'use strict';

var gulp = require('gulp'),
  jade = require('jade'),
  modRewrite = require('connect-modrewrite'),
  webpack = require('webpack-stream');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'browser-sync']
});

// Constants
var BUILD_DIR = 'build/';
var TMP_DIR = '.tmp/';

// Webpack
gulp.task('webpack:vendor', function() {
  return gulp.src('app/scripts/vendor.js')
    .pipe(webpack({
      output: {
        filename: "vendor.js"
      }
    }))
    .pipe(gulp.dest(TMP_DIR + 'scripts/'))
});

gulp.task('webpack', function() {
  return gulp.src('app/scripts/entry.js')
    .pipe(webpack({
      module: {
        loaders: [
          { test: /\.json$/, loader: "json-loader" }
        ]
      },
      output: {
        filename: "app.js"
      }
    }))
    .pipe(gulp.dest(TMP_DIR + 'scripts/'))
    .pipe($.browserSync.reload({stream:true}));
});

// Views
gulp.task('jade:dev', function(){
  return gulp.src('app/views/**/*.jade')
    .pipe($.jade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest(TMP_DIR + 'views'));
});

gulp.task('jade:dist', function(){
  return gulp.src('app/views/**/*.jade')
    .pipe($.jade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest(BUILD_DIR + 'views'));
});

// Html
gulp.task('html:dev', ['jade:dev'], function() {
  return gulp.src(TMP_DIR + 'views/index.html')
    .pipe(gulp.dest(TMP_DIR))
    .pipe($.browserSync.reload({stream:true}));
});

gulp.task('html:dist', ['jade:dist'], function() {
  return gulp.src(BUILD_DIR + 'views/index.html')
    .pipe(gulp.dest(BUILD_DIR))
});

// Sass
gulp.task('sass', function () {
  return $.rubySass('app/styles/app.scss', { sourcemap: true })
    .on('error', function (err) {
      console.error('Error!', err.message);
    })
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(TMP_DIR + 'styles'))
    .pipe($.browserSync.reload({stream:true}));
});

// Images
gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(BUILD_DIR + 'images/'))
    .pipe($.browserSync.reload({stream:true}));
});

// .htaccess
gulp.task('htaccess', function () {
  return gulp.src('.htaccess')
    .pipe(gulp.dest(BUILD_DIR));
});

// Static server
gulp.task('serve:dev', ['dev'], function() {
  $.browserSync({
    server: {
      baseDir: [".", TMP_DIR, "app"],
      middleware: [
        modRewrite([
          '!\\.html|\\.js|\\.css|\\.png|\\.jpg|\\.gif|\\.svg|\\.txt$ /index.html [L]'
        ])
      ]
    }
  });
});

gulp.task('serve:dist', function() {
  $.browserSync({
    server: {
      baseDir: [BUILD_DIR],
      middleware: [
        modRewrite([
          '!\\.html|\\.js|\\.css|\\.png|\\.jpg|\\.gif|\\.svg|\\.txt$ /index.html [L]'
        ])
      ]
    }
  });
});

// e2e tests
gulp.task('webdriver-update', $.protractor.webdriver_update);
gulp.task('protractor', ['webdriver-update'], function () {
  gulp.src(['test/e2e/**/*.js'])
    .pipe($.protractor.protractor({
      configFile: "test/protractor.config.js",
      args: ['--baseUrl', 'http://localhost:3000']
    }))
    .on('error', function (e) {
      throw e
    });
});

// Clean
gulp.task('clean', function () {
  $.del.sync([TMP_DIR + '*', BUILD_DIR + '*']);
});

// Development
gulp.task('dev', ['clean', 'webpack', 'webpack:vendor', 'sass', 'html:dev']);

// Default Task (Dev environment)
gulp.task('default', ['serve:dev'], function() {
  // Scripts
  gulp.watch(['config.json', 'app/scripts/**/*.js'], ['webpack']);

  // Views
  $.watch('app/views/**/*.jade')
    .pipe($.jadeFindAffected())
    .pipe($.jade({jade: jade, pretty: true}))
    .pipe(gulp.dest(TMP_DIR + 'views'));

  // Htmls
  gulp.watch(TMP_DIR + 'views/**/*.html', ['html:dev']);

  // Styles
  gulp.watch('app/styles/**/*.scss', ['sass']);
});

gulp.task('deps', ['html:dist'], function () {
  var assets = $.useref.assets();

  return gulp.src([BUILD_DIR + 'index.html'])
    // Concatenates asset files from the build blocks inside the HTML
    .pipe(assets)
    // Appends hash to extracted files app.css → app-098f6bcd.css
    .pipe($.rev())
    // Adds AngularJS dependency injection annotations
    .pipe($.if('*.js', $.ngAnnotate()))
    // Uglifies js files
    .pipe($.if('*.js', $.uglify()))
    // Minifies css files
    .pipe($.if('*.css', $.csso()))
    // Brings back the previously filtered HTML files
    .pipe(assets.restore())
    // Parses build blocks in html to replace references to non-optimized scripts or stylesheets
    .pipe($.useref())
    // Rewrites occurences of filenames which have been renamed by rev
    .pipe($.revReplace())
    // Minifies html
    .pipe($.if('*.html', $.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    })))
    // Creates the actual files
    .pipe(gulp.dest(BUILD_DIR))
    // Print the file sizes
    .pipe($.size({ title: BUILD_DIR, showFiles: true }));
});

// Distribution
gulp.task('prepare', ['dev', 'images', 'htaccess']);
gulp.task('dist', ['prepare', 'deps']);
