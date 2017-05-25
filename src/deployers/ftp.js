const Deployer = require('./deployer.js');
const gulp = require('gulp');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');
const excludeGitignore = require('gulp-exclude-gitignore');

class Ftp extends Deployer {

	/**
	 * Deploy via file transfer protocol (FTP)
	 * See https://www.npmjs.com/package/vinyl-ftp for connection configuration information
	 *
	 * @param {string} src
	 * @param {string} dest
	 * @param {Object} connection
	 * @param {boolean} gitignore
	 * @return {Object} stream
	 */
	deploy(src, dest, connection, gitignore){

		// no connection
		if(!connection) throw new gutil.PluginError('Propeller FTP Deployer', `No FTP connection information given`);

		// connection configuration
		connection.log = gutil.log;

		// create ftp connection
		let connect = ftp.create(connection);

		// get source file(s)
		let s = gulp.src(src, { base: '.', buffer: false }).on('error', gutil.log);

		// exclude files ignored in .gitignore
		if(gitignore) s = s.pipe(excludeGitignore()).on('error', gutil.log);

		// only upload newer files
		s = s.pipe(connect.newer(dest)).on('error', gutil.log);

		// pipe to destination
		return s.pipe(connect.dest(dest)).on('error', gutil.log);

	}

}

const deployer = new Ftp();
module.exports = deployer;
