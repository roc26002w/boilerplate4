'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Styles
gulp.task('styles', function() {
    return gulp.src('assets/styles/*.scss')
        .pipe($.plumber())
        .pipe($.rubySass({
            bundleExec: true,
            style: 'expanded',
            precision: 10
        }))
        .pipe($.autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('public/styles'))
        .pipe($.size({ title: 'styles' }));
});