const Compiler = require('./compiler.js');
const gulp = require('gulp');
const gutil = require('gulp-util');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');

class Sass extends Compiler {

	/**
	 * Compile Sass files to destination
	 *
	 * @param {string|array} src
	 * @param {string} dest
	 * @return {Object} stream
	 */
	compile(src, dest){

		// get source file(s)
		let s = gulp.src(src);

		// compress and auto-prefix in production builds
		if(!!gutil.env.production){
			s = s.pipe(sass({ outputStyle: 'compressed' }))
				.on('error', gutil.log)
				.pipe(autoprefixer({
					browsers: ['last 2 versions'],
					cascade: false
				}));
		}

		// write source maps in development builds
		else{
			s = s.pipe(sourcemaps.init())
				.on('error', gutil.log)
				.pipe(sass())
				.pipe(sourcemaps.write());
		}

		// pipe to destination
		return s.pipe(gulp.dest(dest).on('error', gutil.log));

	}

}

const compiler = new Sass();
module.exports = compiler;
