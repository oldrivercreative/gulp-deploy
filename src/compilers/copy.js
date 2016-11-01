const Compiler = require('./compiler.js');
const gulp = require('gulp');

class Copy extends Compiler {

	/**
	 * Copy files from source to destination
	 *
	 * @param {string} src
	 * @param {string} dest
	 * @return {Object} stream
	 */
	compile(src, dest){
		return gulp.src(src).pipe(gulp.dest(dest));
	}

}

const compiler = new Copy();
module.exports = compiler;
