const Deployer = require('./deployer.js');
const gulp = require('gulp');
const gutil = require('gulp-util');
const using = require('gulp-using');
const changed = require('gulp-changed');
const excludeGitignore = require('gulp-exclude-gitignore');

class File extends Deployer {

	/**
	 * Deploy via file transfer
	 *
	 * @param {string} src
	 * @param {string} dest
	 * @param {Object} connection
	 * @param {boolean} gitignore
	 * @return {Object} stream
	 */
	deploy(src, dest, connection, gitignore){

		// get source file(s)
		let s = gulp.src(src);

		// exclude files ignored in .gitignore
		if(gitignore) s = s.pipe(excludeGitignore()).on('error', gutil.log);

		// deploy changed files only
		s = s.pipe(changed(dest)).on('error', gutil.log);

		// log file names as they are transferred
		s = s.pipe(using({
			prefix: 'Deploying',
			path: 'relative',
			color: 'blue',
			filesize: true
		})).on('error', gutil.log);

		// pipe to destination
		return s.pipe(gulp.dest(dest)).on('error', gutil.log);

	}

}

const deployer = new File();
module.exports = deployer;
