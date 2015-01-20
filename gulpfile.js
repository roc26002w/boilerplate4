'use strict';

/////// COMMON ///////

// Load plugins
var gulp = require('gulp');
var del = require('del');
var path = require('path');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')();

// Templates
gulp.task('templates', function() {
    return gulp.src('app/templates/**/*.blade.php')
        .pipe($.plumber())
        .pipe(gulp.dest('app/views'))
        .pipe($.size({ title: 'templates' }));
});

// Inject bower components
gulp.task('wiredep', ['templates'], function() {
    var wiredep = require('wiredep').stream;
    var merge = require('merge-stream');

    var styleDeps = gulp.src('assets/styles/*.sass')
        .pipe(wiredep({
            directory: 'public/bower_components'
        }))
        .pipe(gulp.dest('assets/styles'));

    var tplDeps = gulp.src('app/views/**/*.blade.php')
        .pipe(wiredep({
            ignorePath: '../../public/',
            exclude: ['modernizr']
        }))
        .pipe(gulp.dest('app/views'));

    return merge(styleDeps, tplDeps);
});

// Styles
gulp.task('styles', function() {
    return gulp.src('assets/styles/*.sass')
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

// Scripts
gulp.task('scripts', function() {
    return gulp.src('./assets/scripts/*.js')
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(gulp.dest('public/scripts'))
        .pipe($.size({ title: 'scripts' }));
});

// Images
gulp.task('images', function() {
    return gulp.src('assets/images/**/*')
        .pipe($.plumber())
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('public/images'))
        .pipe($.size({ title: 'images' }));
});

// Fonts
gulp.task('fonts', function () {
    return gulp.src([
            'assets/fonts/*.{otf,eot,svg,ttf,woff}',
            'public/bower_components/**/fonts/**/*.{otf,eot,svg,ttf,woff}'
        ])
        .pipe($.flatten())
        .pipe(gulp.dest('public/fonts'))
        .pipe($.size({ title: 'fonts' }));
});

/////// DEVELOPMENT ///////

// Clean
gulp.task('clean:develop', function(cb) {
    del(['app/views', 'public/styles', 'public/scripts', '.sass-cache'], cb);
});

// Prepare for development
gulp.task('prepare', function (cb) {
    runSequence(
        'clean:develop',
        ['wiredep', 'styles', 'scripts', 'images', 'fonts'],
    cb);
});

// Start Web server
gulp.task('serve', function () {
    var spawn = require('child_process').spawn,
        child = spawn('php', [ 'artisan', 'serve' ], { cwd: process.cwd() }),
        log = function (data) { console.log(data.toString()) },
        kill = function () { child.kill(); }
    child.stdout.on('data', log);
    child.stderr.on('data', log);
    process.on('exit', kill);
    process.on('uncaughtException', kill);
});

// Start Livereload server
gulp.task('livereload', function () {
    var server = $.livereload;
    server.listen();
    gulp.watch([
        'public/**/*',
        '!public/bower_components/**/*',
    ]).on('change', server.changed);
});

// Watch
gulp.task('watch', ['prepare'], function() {
    gulp.start('serve');
    gulp.start('livereload');
    gulp.watch(['app/templates/**/*.php', 'bower.json'], ['wiredep']);
    gulp.watch('assets/styles/**/*.scss', ['styles']);
    gulp.watch('assets/scripts/**/*.js', ['scripts']);
    gulp.watch('assets/images/**/*', ['images']);
});

/////// BUILD ///////

// HTML
gulp.task('build', ['wiredep', 'styles', 'scripts', 'images', 'fonts'], function() {

    var saveLicense = require('uglify-save-license');
    var useref = $.useref;
    var assets = $.useref.assets({ searchPath: 'public' });

    return gulp.src('app/views/**/*.blade.php')
        .pipe(assets)
        .pipe($.if('*.js', $.uglify({ preserveComments: saveLicense })))
        .pipe($.if('*.css', $.csso()))
        .pipe($.rev())
        .pipe(gulp.dest('public'))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace({
            replaceInExtensions: ['.php']
        }))
        .pipe(gulp.dest('app/views'));
});

// Clean Cache
gulp.task('clean:cache', function (cb) {
    return $.cache.clearAll(cb);
});

// Clean
gulp.task('clean', ['clean:develop', 'clean:cache'], function(cb) {
    del(['public/css', 'public/js', 'public/fonts', 'public/images'], cb);
});

// Clean temporary assets
gulp.task('clean:temporary', function (cb) {
    del(['app/views/js', 'app/views/css', 'public/scripts', 'public/styles', '.sass-cache'], cb);
});

// Build
gulp.task('default', function(cb) {
    runSequence('clean', 'build', 'clean:temporary', cb);
});
