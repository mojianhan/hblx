const { resolve } = require('path')
const gulp = require('gulp')
const stylus = require('gulp-stylus')
const cleanCSS = require('gulp-clean-css')
const config = require('../.tplconfig')

gulp.task('minify-css', () => {
  return gulp.src(resolve(__dirname, '..', config.srcRoot, '**/*.' + config.cssExtName))
    .pipe(stylus({
      compress: true,
      'include css': true
    }))
    .pipe(cleanCSS({
      compatibility: 'ie8'
    }))
    .pipe(gulp.dest(config.distRoot))
})
