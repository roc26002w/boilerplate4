'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// Inject bower components
gulp.task('wiredep', function() {
    var wiredep = require('wiredep').stream;
    var merge = require('merge-stream');

    var styleDeps = gulp.src('assets/styles/*.scss')
        .pipe(wiredep({
            directory: 'public/bower_components'
        }))
        .pipe(gulp.dest('assets/styles'));

    var tplDeps = gulp.src('app/templates/**/*.blade.php')
        .pipe(wiredep({
            ignorePath: '../../public',
            exclude: ['modernizr']
        }))
        .pipe(gulp.dest('app/views'));

    return merge(styleDeps, tplDeps);
});