
"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var svgmin = require('gulp-svgmin');
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  // gulp.watch("source/js.html", gulp.series("html"));
  gulp.watch("source/*.html").on("change", "html", server.reload)
});

gulp.task("svgmin", function () {
  return gulp.src("source/images/**/*.svg")
    .pipe(svgmin())
    .pipe(gulp.dest("source/images/"))
});

gulp.task("webp", function () {
  return gulp.src("source/images/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/images"))
});

gulp.task("sprite", function () {
  return gulp.src("source/images/svg/icon-*.svg")
    .pipe(svgstore({
      inLineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/images/svg"))
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"))
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/images/**",
    "source/js/**"
    ], {
    base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build")
});

gulp.task("build", function (done) {
  run(
    "clean",
    "copy",
    "css",
    "sprite",
    "html", 
    done
  );
});

gulp.task("build", gulp.series(
    "clean",
    "copy",
    "css",
    "sprite",
    "html",
));

gulp.task("img", gulp.series("svgmin", "webp"));

gulp.task("start", gulp.series("build", "server"));
