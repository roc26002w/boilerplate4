'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('build', ['wiredep', 'styles', 'scripts', 'images', 'fonts'], function() {

    var saveLicense = require('uglify-save-license');
    var assets = $.useref.assets({ searchPath: 'public' });

    return gulp.src('app/views/**/*.blade.php')
        .pipe(assets)
        .pipe($.if('*.js', $.uglify({ preserveComments: saveLicense })))
        .pipe($.if('*.css', $.csso()))
        .pipe(gulp.dest('styleguide'))
        .pipe($.rev())
        .pipe(gulp.dest('public'))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace({
            replaceInExtensions: ['.php']
        }))
        .pipe(gulp.dest('app/views'));
});