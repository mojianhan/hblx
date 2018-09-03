const requireDir = require('require-dir')
const gulp = require('gulp')
const dir = requireDir('./tasks')

gulp.task('default', [
  'minify-html',
  'minify-css',
  'minify-js',
  'copy'
])
