var gulp = require('gulp'),
    sass = require('gulp-sass'),
    jshint = require('gulp-jshint'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    changed = require('gulp-changed'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    bs = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer');

// Declare browsers we need to support. For autoprefixer
var browsers = [
    'last 4 versions',
    'android 4',
    'opera 12',
    'ie 9'
];

// Project paths + vHost domain url (for browserSync)
var base = {
    devUrl: 'http://quicklandinges5.dev/',
    src:    'assets/',
    dist:   'dist/'
};

var path = {
    styles: {
        src:  base.src + 'styles/',
        dest: base.dist + 'styles/'
    },
    js:     {
        src:  base.src + 'js/',
        dest: base.dist + 'js/'
    },
    images: {
        src:  base.src + 'images/',
        dest: base.dist + 'images/'
    }
};

gulp.task('styles', function () {
    gulp.src(path.styles.src + 'style.scss')
        .pipe(sass({
            includePaths: [
                '.',
                'node_modules/breakpoint-sass/stylesheets'
            ]
        }).on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: browsers,
            cascade:  false
        }))
        .pipe(gulp.dest(path.styles.dest))
        .pipe(bs.reload({stream: true}));
});

gulp.task('scripts', ['jshint'], function () {
    return gulp.src([
        path.js.src + 'custom/default.js'
    ])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(path.js.dest))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))// Creates sourcemap for minified JS
        .pipe(gulp.dest(path.js.dest))
});

// Imagemin
gulp.task('images', function () {
    return gulp.src(path.images.src + '**/*.*')
        .pipe(changed(path.images.dest))
        .pipe(imagemin([
            imagemin.svgo({plugins: [{cleanupIDs: false}]})
        ]))
        .pipe(gulp.dest(path.images.dest))
        .pipe(bs.reload({stream: true}))
});

gulp.task('bs', ['styles'], function () {
    bs.init({
        server: {
            baseDir: "./"
        }
    });
});

// JsHint (for checking JS issues)
gulp.task('jshint', function () {
    return gulp.src(
        [
            path.js.src + 'custom/**/*.*'
        ])
        .pipe(jshint({
            esversion: 6
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('js_copytodist', function () {
    return gulp.src(path.js.src + 'vendor/copy_to_dist/**/*.*')
        .pipe(changed(path.js.dest))
        .pipe(gulp.dest(path.js.dest));
});

gulp.task('watch', ['bs'], function () {
    // Watch .scss files
    gulp.watch([path.styles.src + '**/*.*'], ['styles']);
    // Watch site-js files
    gulp.watch([path.js.src + '**/*.*'], ['jshint', 'scripts']).on('change', bs.reload);
    // Watch Everything else
    gulp.watch(['**/*.html']).on('change', bs.reload);
});

// Run styles, site-js and foundation-js
gulp.task('default', ['js_copytodist', 'styles', 'scripts', 'images']);