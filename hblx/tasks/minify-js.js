const { resolve } = require('path')
const pump = require('pump')
const gulp = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const requirejs = require('requirejs')
const config = require('../.tplconfig')

gulp.task('minify-js', (cb) => {
  pump(
    [
      gulp.src(resolve(__dirname, '..', config.srcRoot, '**/*.' + config.jsExtName)),
      babel(),
      uglify(),
      gulp.dest(config.distRoot)
    ],
    cb
  )
})
