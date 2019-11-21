"use strict"

const autoprefixer = require("autoprefixer"),
	bourbon = require("node-bourbon").includePaths,
	browserSync = require("browser-sync").create(),
	cache = require("gulp-cache"),
	cachebust = require("gulp-cache-bust"),
	cmq = require("css-mqpacker"),
	cssnano = require("cssnano"),
	del = require("del"),
	ghpages = require("gulp-gh-pages"),
	gulp = require("gulp"),
	imagemin = require("gulp-imagemin"),
	imageminJpegRecompress = require("imagemin-jpeg-recompress"),
	imageminMozjpeg = require("imagemin-mozjpeg"),
	isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "dev",
	notifier = require("node-notifier"),
	path = require("path"),
	plumber = require("gulp-plumber"),
	pngquant = require("imagemin-pngquant"),
	postcss = require("gulp-postcss"),
	processhtml = require("gulp-processhtml"),
	rename = require("gulp-rename"),
	runSequence = require("run-sequence"),
	sass = require("gulp-sass"),
	sassGlob = require("gulp-sass-glob"),
	spritesmith = require("gulp.spritesmith"),
	svgmin = require("gulp-svgmin"),
	svgSprite = require("gulp-svg-sprites"),
	webpack = require("webpack")

//
// STYLES TASKS
//

gulp.task("sass", () => {
	const processors = [autoprefixer()]
	return gulp
		.src("./src/scss/**/*.scss")
		.pipe(plumber())
		.pipe(sassGlob())
		.pipe(
			sass({
				outputStyle: "expanded",
				includePaths: bourbon
			}).on("error", sass.logError)
		)
		.pipe(postcss(processors))
		.pipe(gulp.dest("dev/css/"))
		.pipe(browserSync.stream())
})

gulp.task("cssBuild", () => {
	const processors = [cssnano({ discardComments: { removeAll: true } }), cmq()]

	return gulp
		.src("dev/css/**/*.css")
		.pipe(plumber())
		.pipe(postcss(processors))
		.pipe(
			rename({
				suffix: ".min"
			})
		)
		.pipe(gulp.dest("./build/css"))
})

//
//  JS TASKS
//

gulp.task("webpack", callback => {
	let options = {
		entry: "./src/scripts/index",
		output: {
			path: isDev ? path.join(__dirname, "/dev/js") : path.join(__dirname, "/build/js"),
			filename: isDev ? "app.js" : "app.min.js"
		},
		watch: isDev,
		devtool: isDev ? "eval-source-map" : false,
		module: {
			rules: [
				{
					test: /.js?$/,
					loader: "babel-loader",
					exclude: /node_modules|bower_components/
				}
			]
		},
		watchOptions: {
			aggregateTimeout: 10
		},
		resolve: {
			modules: ["node_modules", "bower_components"]
		},
		plugins: [new webpack.NoEmitOnErrorsPlugin()]
	}

	if (!isDev) {
		options.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					// don't show unreachable variables etc
					unsafe: true,
					warnings: false
				},
				comments: false,
				mangle: true
			})
		)
	}

	webpack(options, (err, stats) => {
		if (!err) {
			err = stats.toJson().errors[0]
		}

		if (err) {
			notifier.notify({
				title: "Webpack",
				message: err
			})

			console.error(err)
		} else {
			console.info(
				stats.toString({
					colors: true
				})
			)
		}

		if (!options.watch && err) {
			callback(err)
		} else {
			// callback();
		}
	})
})

//
//    GRAPHICS TASK
//

gulp.task("images", () => {
	return gulp
		.src(["./dev/img/*.{jpg,jpeg,png,gif}", "!./dev/img/sprite/"])
		.pipe(imagemin([imageminMozjpeg({ quality: 70 }), pngquant({ quality: "65-80" }), imageminJpegRecompress({ target: 70 }), imagemin.gifsicle()]))
		.pipe(gulp.dest("./build/img"))
})

gulp.task("svg", () => {
	return gulp
		.src("./dev/img/*.svg")
		.pipe(
			svgmin({
				plugins: [
					{
						cleanupIDs: {
							remove: false
						}
					},
					{ removeTitle: {} }
				]
			})
		)
		.pipe(gulp.dest("./build/img"))
})

/*
  SPRITES
 */
gulp.task("sprite", () => {
	const spriteData = gulp.src("./dev/img/sprite/*.png").pipe(
		spritesmith({
			imgName: "sprite.png",
			cssName: "_sprite.scss",
			cssFormat: "scss",
			algorithm: "binary-tree",
			cssTemplate: "scss.template.mustache"
		})
	)
	spriteData.img.pipe(gulp.dest("./dev/img/"))
	spriteData.css.pipe(gulp.dest("./src/scss/utils"))
})
gulp.task("retina_sprite", () => {
	const spriteData = gulp.src("./dev/img/sprite/*.png").pipe(
		spritesmith({
			imgName: "sprite.png",
			cssName: "_sprite.scss",
			cssFormat: "scss",
			algorithm: "binary-tree",
			cssTemplate: "scss.template.mustache",
			retinaSrcFilter: "./dev/img/sprite/*2x.png",
			retinaImgName: "spritesheet-2x.png"
		})
	)
	spriteData.img.pipe(gulp.dest("./dev/img/"))
	spriteData.css.pipe(gulp.dest("./src/scss/utils"))
})

/*
 SVG SPRITE
 */
gulp.task("svgSprite", () => {
	return gulp
		.src("./dev/img/sprite/*.svg")
		.pipe(
			svgSprite({
				cssFile: "../../src/scss/base/_svg-sprite.scss",
				mode: "symbols",
				preview: false,
				selector: "icon-%f",
				svg: {
					symbols: "sprite.svg"
				},
				templates: { scss: true }
			})
		)
		.pipe(gulp.dest("./dev/img/"))
})

//
// HTML TASK
//

gulp.task("html", () => {
	return gulp
		.src("./dev/*.html")
		.pipe(processhtml())
		.pipe(
			cachebust({
				type: "timestamp"
			})
		)
		.pipe(gulp.dest("./build"))
})

//
// SERVE & WATCH TASKS
//

gulp.task("serve", () => {
	browserSync.init({
		server: "./dev"
	})
	gulp.watch(["./dev/**/*.*", "!./dev/img/sprite/"]).on("change", browserSync.reload)
	gulp.watch("./src/scss/**/*.scss", ["sass"])
})

gulp.task("process", ["serve", "sass", "webpack"], () => {})

//
// BUILDING TASKS
//

gulp.task("default", () => {
	gulp.start("process")
})

gulp.task("build", cb => {
	runSequence("clean:build", "copy", ["cssBuild", "webpack", "html", "images", "svg"], cb)
})

//
// DEPLOY TASKS
//
gulp.task("ghdeploy", () => {
	return gulp.src("build/**/*").pipe(ghpages())
})

//
// MISC TASKS
//

gulp.task("clean", cb => {
	del("build")
	return cache.clearAll(cb)
})

gulp.task("clean:build", () => {
	return del.sync(["./build/**/*", "!./build/img", "!./build/img/**/*"])
})

gulp.task("copy", ["fonts"], () => {
	return gulp.src(["./dev/*", "!dev/img/", "!dev/scss", "!dev/scss/**/*", "!dev/css/**/*", "!dev/js/**/*"]).pipe(gulp.dest("./build"))
})

gulp.task("fonts", () => {
	return gulp.src("./dev/fonts/**/*").pipe(gulp.dest("./build/fonts"))
})
