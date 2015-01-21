'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Scripts
gulp.task('scripts', function() {
    return gulp.src('./assets/scripts/*.js')
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest('public/scripts'))
        .pipe($.size({ title: 'scripts' }));
});