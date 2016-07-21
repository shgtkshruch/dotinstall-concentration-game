const  gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require ('browser-sync');
const autoprefixer = require('autoprefixer');
const sorting = require('postcss-sorting');
const mqpacker = require('css-mqpacker');
const stylefmt = require('stylefmt');
const del = require('del');
const ghpages = require('gh-pages');
const path = require('path');
const runSequence = require('run-sequence');

const $ = gulpLoadPlugins();
const bs = browserSync.create();

gulp.task('browserSync', () => {
  bs.init({
    server: {
      baseDir: 'dist',
      routes: {
        '/bower_components': 'bower_components'
      }
    },
    notify: false,
    browser: 'Google Chrome Canary'
  });
});

gulp.task('html', ['pug', 'sass', 'js'], () => {
  return gulp.src('dist/index.html')
    .pipe($.useref())
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe($.if('*.css', $.cleanCss()))
    .pipe($.if('*.js', $.uglify()))
    .pipe(gulp.dest('dist'));
});

gulp.task('pug', () => {
  return gulp.src('src/**/*.pug')
    .pipe($.plumber())
    .pipe($.changed('dist', {
      extension: '.html'
    }))
    .pipe($.pug({
      pretty: true
    }))
    .pipe($.prettify({
      condense: true,
      padcomments: false,
      indent: 2,
      indent_char: ' ',
      indent_inner_html: 'false',
      brace_style: 'expand',
      wrap_line_length: 0,
      preserve_newlines: true
    }))
    .pipe(gulp.dest('dist'))
    .pipe(bs.stream());
});

gulp.task('sass', () => {
  return gulp.src('src/styles/main.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([
      autoprefixer({browers: ['last 2 version', 'ie9', 'ie8']}),
      sorting({'sort-order': 'yandex'}),
      mqpacker,
      stylefmt
    ]))
    .pipe(gulp.dest('dist/styles'))
    .pipe(bs.stream());
});

gulp.task('js', () => {
  return gulp.src('src/scripts/*.js')
    .pipe($.plumber())
    .pipe($.changed('dist', {
      extension: '.js'
    }))
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('dist/scripts'))
    .pipe(bs.stream());
});

gulp.task('image', () => {
  return gulp.src('src/images/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('clean:all', () => {
  return del('dist');
});

gulp.task('clean:build', () => {
  return del([
    'dist/partials',
    'dist/{styles,scripts}/*',
    '!dist/{styles,scripts}/{main,vendor}.*',
  ]);
});

gulp.task('ghpages', () => {
  return ghpages.publish(path.join(__dirname, 'dist'));
});

gulp.task('watch', () => {
  gulp.watch('src/**/*.pug', ['pug']);
  gulp.watch('src/styles/*.scss', ['sass']);
  gulp.watch('src/scripts/*.js', ['js']);
  gulp.watch('src/images/*', ['image']);
});

gulp.task('default', () => {
  runSequence(['pug', 'sass', 'js', 'image'], 'browserSync', 'watch');
});

gulp.task('build', () => {
  runSequence('clean:all', ['html', 'image'], 'clean:build');
});

gulp.task('publish', () => {
  runSequence('build', 'ghpages');
});

