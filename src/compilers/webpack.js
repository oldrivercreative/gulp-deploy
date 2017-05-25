const Compiler = require('./compiler.js');
const gulp = require('gulp');
const gutil = require('gulp-util');
const webpack = require('webpack-stream');

/**
 * Webpack + Babel + ES2015 JavaScript compiler
 */
class Webpack extends Compiler {

	/**
	 * Compile src to destination
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

		// webpack config
		let wpconfig = {
			output: {
				filename: bundle
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
		let s = gulp.src(src).on('error', gutil.log).pipe(webpack(wpconfig));

		// pipe to destination
		return s.pipe(gulp.dest(dest).on('error', gutil.log));

	}

}

const compiler = new Webpack();
module.exports = compiler;
