'use strict';

var gulp = require('gulp');
var modRewrite = require('connect-modrewrite');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'browser-sync']
});

// Webpack
gulp.task('webpack', function() {
  return gulp.src('app/scripts/entry.js')
    .pipe($.webpack({
      module: {
        loaders: [
          { test: /\.jade$/, loader: "jade-loader" },
          { test: /\.json$/, loader: "json-loader" }
        ]
      },
      output: {
        filename: "app.js"
      }
    }))
    .pipe(gulp.dest('build/dev/scripts/'))
    .pipe($.browserSync.reload({stream:true}));
});

// Html
gulp.task('html', function() {
  return gulp.src('app/index.html')
    .pipe(gulp.dest('build/dev'))
    .pipe($.browserSync.reload({stream:true}))
});

// Sass
gulp.task('sass', function () {
  return $.rubySass('app/styles/app.scss', { sourcemap: true })
    .on('error', function (err) {
      console.error('Error!', err.message);
    })
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('build/dev/styles'))
    .pipe($.browserSync.reload({stream:true}));
});

// Images
gulp.task('images:dev', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest('build/dev/images/'))
    .pipe($.browserSync.reload({stream:true}));
});

gulp.task('images:dist', function () {
  return gulp.src('app/images/**/*')
    .pipe($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('build/dist/images/'))
    .pipe($.browserSync.reload({stream:true}));
});

// .htaccess
gulp.task('htaccess', function () {
  return gulp.src('.htaccess')
    .pipe(gulp.dest('build/dist/'));
});

// Static server
gulp.task('serve:dev', function() {
  $.browserSync({
    server: {
      baseDir: [".","build/dev"],
      middleware: [
        modRewrite([
          '!\\.html|\\.js|\\.css|\\.png|\\.jpg|\\.gif$ /index.html [L]'
        ])
      ]
    }
  });
});

gulp.task('serve:dist', function() {
  $.browserSync({
    server: {
      baseDir: ["build/dist"],
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

// Bower dependencies
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  return gulp.src('app/index.html')
    .pipe(wiredep({
      directory: 'bower_components'
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('bower', function() {
  return $.bower();
});

// Clean
gulp.task('clean', function () {
  $.del.sync(['build/dev/*', 'build/dist/*']);
});

// Default Task (Dev environment)
gulp.task('default', ['dev', 'serve:dev'], function(callback) {
  // Webpack
  gulp.watch(['app/scripts/**/*.js', 'app/views/**/*.jade'], ['webpack']);

  // Htmls
  gulp.watch('app/*.html', ['html']);

  // Styles
  gulp.watch('app/styles/**/*.scss', ['sass']);

  // Images
  gulp.watch('app/images/**/*', ['images:dev']);
});

// Development
gulp.task('dev', ['clean','bower','html','webpack','images:dev','sass']);

// Distribution
gulp.task('dist', ['wiredep', 'dev', 'images:dist', 'htaccess'], function () {
  var assets = $.useref.assets();

  return gulp.src(['app/*.html'])
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
    .pipe(gulp.dest('build/dist/'))
    // Print the file sizes
    .pipe($.size({ title: 'build/dist/', showFiles: true }));
});
