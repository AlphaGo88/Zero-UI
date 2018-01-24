var gulp = require('gulp'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    minify = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jsFiles = [
        'js/checkJQuery.js',
        'js/components/*.js',
        'js/init.js'
    ];

gulp.task('less', function() {
    gulp.src('less/zui.less')
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(gulp.dest('dist'));
});

gulp.task('less-watch', function() {
    gulp.watch('less/**/*.less', ['less']);
});

gulp.task('css', function() {
    gulp.src('less/zui.less')
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(minify())
        .pipe(rename('zui.min.css'))
        .pipe(gulp.dest('dist'));
});

gulp.task('js-concat', function() {
    gulp.src(jsFiles)
        .pipe(concat('zui.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('js', function() {
    gulp.src(jsFiles)
        .pipe(concat('zui.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('js-watch', function() {
    gulp.watch('js/**/*.js', ['js-concat']);
});

gulp.task('dev', ['less-watch', 'js-watch']);

gulp.task('default', ['less', 'css', 'js-concat', 'js']);