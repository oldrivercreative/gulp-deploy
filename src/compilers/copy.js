const Compiler = require('./compiler.js');
const gulp = require('gulp');
const gutil = require('gulp-util');

class Copy extends Compiler {

	/**
	 * Copy files from source to destination
	 *
	 * @param {string|array} src
	 * @param {string} dest
	 * @return {Object} stream
	 */
	compile(src, dest){
		return gulp.src(src)
			.on('error', gutil.log)
			.pipe(gulp.dest(dest));
	}

}

const compiler = new Copy();
module.exports = compiler;
