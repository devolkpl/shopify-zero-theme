const {watch, src, dest, series, parallel} = require("gulp")
const postcss = require("gulp-postcss")
const sass = require('gulp-sass')(require('sass'));
const sassGlob = require("gulp-sass-glob")
const autoprefixer = require("autoprefixer")
const cssnano = require("cssnano")
const del = require("del")
const prettier = require('gulp-prettier')
const uglify = require('gulp-uglify')
const rollup = require("rollup")
const rollupCommonJs = require("@rollup/plugin-commonjs")
const rollupNodeResolve = require("@rollup/plugin-node-resolve").nodeResolve
const rollupTerser = require("rollup-plugin-terser").terser
const rename = require('gulp-rename');

const logger = require("eazy-logger").Logger({
  useLevelPrefixes: false
})

let rollupCache;

const __ = {
  assets: "./../theme/assets",
  snippets: "./../theme/snippets"
}

// async function buildJsWithCache() {
//   const bundle = await rollup.rollup({
// 	cache: rollupCache,
// 	input: "./scripts/theme.js",
// 	watch: {
// 	  include: "./scripts/**",
// 	  exclude: "./node_modules/**"
// 	},
// 	treeshake: true,
// 	plugins: [
// 	  rollupNodeResolve({
// 		browser: true
// 	  }),
// 	  rollupCommonJs({sourceMap: false}),
// 	  rollupTerser()
// 	]
//   });
  
//   rollupCache = bundle.cache;
//   return bundle;
// }

function jsTask(done) {
	src(["scripts/**/*.js"], {sourcemaps: false})
		.pipe(uglify())
		.on("error", error)
		.pipe(dest(__.assets, {sourcemaps: false}))

	done()
//   buildJsWithCache().then(bundle => {
// 	bundle.write({
// 		sourcemap: false,
// 		file: __.assets + "/theme.js",
// 		format: "iife",
// 		indent: false
// 	  })
// 	  .then(done())
//   })
}

function scssTask(done) {
  src(["styles/**/*.scss", "!styles/critical.scss"], {sourcemaps: false})
	.pipe(sassGlob())
	.pipe(sass({outputStyle: "compressed" }))
	.on("error", error)
	.pipe(postcss([autoprefixer({grid: true}), cssnano()]))
	.on("error", error)
	.pipe(dest(__.assets, {sourcemaps: false}))

src(["styles/critical.scss"], {sourcemaps: false})
	.pipe(sassGlob())
	.pipe(sass({outputStyle: "compressed" }))
	.on("error", error)
	.pipe(postcss([autoprefixer({grid: true}), cssnano()]))
	.on("error", error)
	.pipe(rename('css-critical.liquid'))
	.pipe(dest(__.snippets, {sourcemaps: false}))
  
  done()
}

function watchFiles(done) {
  watch("./scripts/**/*.js", {interval: 1000}, series(jsTask))
  watch("./styles/**/*.scss", {interval: 1000}, series(scssTask))
  done()
}

function error(message) {
  console.log(message)
  this.emit("end")
}

exports.watch = parallel(jsTask, scssTask, watchFiles)