const Deployer = require('./deployer.js');
const gulp = require('gulp');
const sftp = require('gulp-sftp');

class Sftp extends Deployer {

	/**
	 * Deploy via secure file transfer protocol (SFTP)
	 * See https://www.npmjs.com/package/gulp-sftp for connection configuration information
	 *
	 * @param {string} src
	 * @param {string} dest
	 * @param {Object} connection
	 * @return {Object} stream
	 */
	deploy(src, dest, connection){

		// no connection
		if(!connection) throw new gutil.PluginError('Propeller FTP Deployer', `No FTP connection information given`);

		// connection configuration
		connection.remotePath = dest;

		// get source file(s)
		let s = gulp.src(src);

		// pipe to destination
		return s.pipe(sftp(connection));

	}

}

const deployer = new Sftp();
module.exports = deployer;
