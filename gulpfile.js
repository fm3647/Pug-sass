/*global require*/
"use strict";

var gulp = require('gulp'),
  path = require('path'),
  data = require('gulp-data'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync');

/*
 * Directories here
 */
var paths = {
  public: './public/',
  sass: './src/sass/',
  css: './public/css/',
  data: './src/_data/'
};

/**
 * Compile .pug files and pass in data from json file
 * matching file name. index.pug - index.pug.json
 */
gulp.task('pug', function () {
  return gulp.src('./src/*.pug')
    .pipe(data(function (file) {
      return require(paths.data + path.basename(file.path) + '.json');
    }))
    .pipe(pug({
      pretty: true  // html압축취소 삭제시, 한줄로표기 됨
    }))
    .on('error', function (err) {
      process.stderr.write(err.message + '\n');
      this.emit('end');
    })
    .pipe(gulp.dest(paths.dist));
});

/**
 * Recompile .pug files and live reload the browser
 */
gulp.task('rebuild', ['pug'], function () {
  browserSync.reload();
});

/**
 * Wait for pug and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', ['sass', 'pug'], function () {
  browserSync({
    server: {
      baseDir: paths.dist
    },
    notify: false
  });
});

/**
 * Compile .scss files into dist css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('sass', function () {
  return gulp.src(paths.sass + '*.scss')
    .pipe(sass({
      includePaths: [paths.sass],
      outputStyle: 'compressed'     // css压缩
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest(paths.css))
    .pipe(browserSync.reload({
      stream: true
    }));
});
// Scripts
gulp.task('scripts', function() {
  return gulp.src(['src/js/**/*.js','!src/js/lib/*.js'])  // 忽略lib目录里的所有接收文件
    .pipe(jshint(''))                                     // js检测
    .pipe(jshint.reporter('default'))
    .pipe(concat('all.js'))                               // js合并之后命名
    .pipe(rename({ suffix: '.min' }))                     // js压缩
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))                           //저장경로
    .pipe(notify({ message: 'Scripts task complete' }));
});

// 压缩图片
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
  .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({ message: 'Images task complete' }));
});

// move static assets
gulp.task('assets', function () {
    gulp.src('src/js/lib/*')
        .pipe(gulp.dest('dist/js/lib')); //移动没压缩的js文件
    // gulp.src('./src/img/**')
    //     .pipe(gulp.dest('./dist/img'));
});

gulp.task('watch', function () {
  gulp.watch(paths.sass + '**/*.scss', ['sass']);
  gulp.watch('./src/**/*.pug', ['rebuild']);
  gulp.watch('./src/js/*.js', ['uglify']);
});

/**
 * Build task compile sass and pug and scripts and images.
 * 只有在导出的时候，才压缩js文件和图片文件
 */
gulp.task('build', ['sass', 'pug','scripts', 'images', 'assets']);

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', ['browser-sync', 'scripts', 'watch']);
