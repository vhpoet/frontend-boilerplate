'use strict';

var gulp = require('gulp'),
  jade = require('jade'),
  modRewrite = require('connect-modrewrite'),
  webpack = require('webpack-stream'),
  NwBuilder = require('nw-builder');

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'browser-sync']
});

// Constants
var DIST_FOLDER = 'build/dist/';
var DEV_FOLDER = 'build/dev/';
var PACKAGES_FOLDER = 'build/packages/';

var meta = require('./package.json');

// Webpack
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
    .pipe(gulp.dest(DEV_FOLDER + 'scripts/'))
    .pipe($.browserSync.reload({stream:true}));
});

// Views
gulp.task('jade:dev', function(){
  return gulp.src('app/views/**/*.jade')
    .pipe($.jade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest(DEV_FOLDER + 'views'));
});

gulp.task('jade:dist', function(){
  return gulp.src('app/views/**/*.jade')
    .pipe($.jade({
      jade: jade,
      pretty: true
    }))
    .pipe(gulp.dest(DIST_FOLDER + 'views'));
});

// Html
gulp.task('html:dev', ['jade:dev'], function() {
  return gulp.src(DEV_FOLDER + 'views/index.html')
    .pipe(gulp.dest(DEV_FOLDER))
    .pipe($.browserSync.reload({stream:true}));
});

gulp.task('html:dist', ['jade:dist'], function() {
  return gulp.src(DIST_FOLDER + 'views/index.html')
    .pipe(gulp.dest(DIST_FOLDER))
});

// Sass
gulp.task('sass', function () {
  return $.rubySass('app/styles/app.scss', { sourcemap: true })
    .on('error', function (err) {
      console.error('Error!', err.message);
    })
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(DEV_FOLDER + 'styles'))
    .pipe($.browserSync.reload({stream:true}));
});

// Images
gulp.task('images:dist', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(DIST_FOLDER + 'images/'))
});

gulp.task('images:dev', function () {
  return gulp.src('app/images/**/*')
    .pipe(gulp.dest(DEV_FOLDER + 'images/'))
    .pipe($.browserSync.reload({stream:true}));
});

// package.json
gulp.task('packagejson', function () {
  return gulp.src('app/package.json')
    .pipe(gulp.dest(DIST_FOLDER))
});

// .htaccess
gulp.task('htaccess', function () {
  return gulp.src('.htaccess')
    .pipe(gulp.dest(DIST_FOLDER));
});

// Static server
gulp.task('serve:dev', ['dev'], function() {
  $.browserSync({
    open: false,
    server: {
      baseDir: [".",DEV_FOLDER,"app"],
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
    open: false,
    server: {
      baseDir: [DIST_FOLDER],
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
  $.del.sync([DEV_FOLDER + '*', DIST_FOLDER + '*']);
});

// Development
gulp.task('dev', ['clean', 'bower', 'webpack', 'sass', 'html:dev', 'images:dev']);

// Default Task (Dev environment)
gulp.task('default', ['serve:dev'], function() {
  // Scripts
  gulp.watch(['config.json', 'app/scripts/**/*.js'], ['webpack']);

  // Views
  $.watch('app/views/**/*.jade')
    .pipe($.jadeFindAffected())
    .pipe($.jade({jade: jade, pretty: true}))
    .pipe(gulp.dest(DEV_FOLDER + 'views'));

  // Htmls
  gulp.watch(DEV_FOLDER + 'views/**/*.html', ['html:dev']);

  // Styles
  gulp.watch('app/styles/**/*.scss', ['sass']);
});

gulp.task('deps', ['html:dist'], function () {
  var assets = $.useref.assets();

  return gulp.src([DIST_FOLDER + 'index.html'])
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
    .pipe(gulp.dest(DIST_FOLDER))
    // Print the file sizes
    .pipe($.size({ title: DIST_FOLDER, showFiles: true }));
});

// Distribution
gulp.task('prepare', ['wiredep', 'dev', 'images:dist', 'htaccess', 'packagejson']);
gulp.task('dist', ['prepare', 'deps']);

// Packages
gulp.task('packages', function() {
  var nw = new NwBuilder({
    files: ['build/dist/**/**'], // use the glob format
    platforms: ['win', 'osx', 'linux'],
    appName: meta.name,
    buildDir: 'build/packages',
    macZip: true
    // TODO: timestamped versions
    // TODO: macIcns
    // TODO: winIco
  });

  return nw.build()
    .then(function(){
      // Zip the packages
      gulp.src(PACKAGES_FOLDER + meta.name + '/linux32/**/*')
        .pipe($.zip('linux32.zip'))
        .pipe(gulp.dest(PACKAGES_FOLDER + meta.name));

      gulp.src(PACKAGES_FOLDER + meta.name + '/linux64/**/*')
        .pipe($.zip('linux64.zip'))
        .pipe(gulp.dest(PACKAGES_FOLDER + meta.name));

      gulp.src(PACKAGES_FOLDER + meta.name + '/osx32/**/*')
        .pipe($.zip('osx32.zip'))
        .pipe(gulp.dest(PACKAGES_FOLDER + meta.name));

      gulp.src(PACKAGES_FOLDER + meta.name + '/osx64/**/*')
        .pipe($.zip('osx64.zip'))
        .pipe(gulp.dest(PACKAGES_FOLDER + meta.name));

      gulp.src(PACKAGES_FOLDER + meta.name + '/win32/**/*')
        .pipe($.zip('win32.zip'))
        .pipe(gulp.dest(PACKAGES_FOLDER + meta.name));

      gulp.src(PACKAGES_FOLDER + meta.name + '/win64/**/*')
        .pipe($.zip('win64.zip'))
        .pipe(gulp.dest(PACKAGES_FOLDER + meta.name));
    })
    .catch(function (error) {
      console.error(error);
    });
});

