const Deployer = require('./deployer.js');
const gulp = require('gulp');
const gutil = require('gulp-util');
const sftp = require('gulp-sftp');
const excludeGitignore = require('gulp-exclude-gitignore');

class Sftp extends Deployer {

	/**
	 * Deploy via secure file transfer protocol (SFTP)
	 * See https://www.npmjs.com/package/gulp-sftp for connection configuration information
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
		connection.remotePath = dest;

		// get source file(s)
		let s = gulp.src(src).on('error', gutil.log);

		// exclude files ignored in .gitignore
		if(gitignore) s = s.pipe(excludeGitignore()).on('error', gutil.log);

		// pipe to destination
		return s.pipe(sftp(connection)).on('error', gutil.log);

	}

}

const deployer = new Sftp();
module.exports = deployer;
