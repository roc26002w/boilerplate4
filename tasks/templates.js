'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Templates
gulp.task('templates', function() {
    return gulp.src('app/templates/**/*.blade.php')
        .pipe($.plumber())
        .pipe(gulp.dest('app/views'))
        .pipe($.size({ title: 'templates' }));
});