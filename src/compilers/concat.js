const Compiler = require('./compiler.js');
const gulp = require('gulp');
const concat = require('gulp-concat');

class Concat extends Compiler {

	/**
	 * Concatenate source files at destination
	 *
	 * @param {string|array} src
	 * @param {string} dest
	 * @return {Object} stream
	 */
	compile(src, dest){

    // pop bundle file name
		dest = dest.split('/');
		let bundle = dest.pop();
		dest = dest.join('/');

    // concatenate at destination
		return gulp.src(src).pipe(concat(bundle)).pipe(gulp.dest(dest));

	}

}

const compiler = new Concat();
module.exports = compiler;
