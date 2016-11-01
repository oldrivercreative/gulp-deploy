const Deployer = require('./deployer.js');
const gulp = require('gulp');
const using = require('gulp-using');
const changed = require('gulp-changed');

class File extends Deployer {

	/**
	 * Deploy via file transfer
	 *
	 * @param {string} src
	 * @param {string} dest
	 * @param {Object} connection
	 * @return {Object} stream
	 */
	deploy(src, dest, connection){

		// get source file(s)
		let s = gulp.src(src);

		// deploy changed files only
		s = s.pipe(changed(dest));

		// log file names as they are transferred
		s = s.pipe(using({
			prefix: 'Deploying',
			path: 'relative',
			color: 'blue',
			filesize: true
		}));

		// pipe to destination
		return s.pipe(gulp.dest(dest));

	}

}

const deployer = new File();
module.exports = deployer;
