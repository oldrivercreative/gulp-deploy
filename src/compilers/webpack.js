const Compiler = require('./compiler.js');
const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('gulp-webpack');

/**
 * Webpack + Babel + ES2015 JavaScript compiler
 */
class Webpack extends Compiler {

	/**
	 * Compile src to destination
	 *
	 * @param {string} src
	 * @param {string} dest
	 * @return {Object} stream
	 */
	compile(src, dest){

		// pop entry file name
		dest = dest.split('/');
		let entry = dest.pop();
		dest = dest.join('/');

		// webpack config
		let wpconfig = {
			output: {
				filename: entry
			},
			module: {
				loaders: [
					{
						test: /\.js$/,
						exclude: /(node_modules|bower_components)/,
						loader: 'babel',
						query: {
							presets: ['es2015']
						}
					}
				]
			}
		};

		// minify using Babili in production builds
		if(!!gutil.env.production){
			wpconfig.module.loaders[0].query.presets = ['babili'];
		}

		// webpack
		let s = gulp.src(src).pipe(webpack(wpconfig));

		// pipe to destination
		return s.pipe(gulp.dest(dest));

	}

}

const compiler = new Webpack();
module.exports = compiler;
