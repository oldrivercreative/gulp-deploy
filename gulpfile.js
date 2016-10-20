// dependencies
const gulp = require('gulp-param')(require('gulp'), process.argv);
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const webpack = require('gulp-webpack');
const changed = require('gulp-changed');
const using = require('gulp-using');
const gutil = require('gulp-util');
const ftp = require('vinyl-ftp');
const sftp = require('gulp-sftp');

// configuration
const config = require('./gulpconfig.json');

// stylesheets
gulp.task('stylesheets', function(production){

	// init stream
	let s;

	// each stylesheet operation
	for(let stylesheet of config.stylesheets){

		// get path
		let path = stylesheet.split('>');
		if(path.length != 2){
			break;
		}
		let src = path[0].trim();
		let dest = path[1].trim();

		// stream
		s = gulp.src(src);

		// [--production]
		if(production){
			s = s.pipe(sass({ outputStyle: 'compressed' }))
				.pipe(autoprefixer({
					browsers: ['last 2 versions'],
					cascade: false
				}))
				.pipe(sass({
					outputStyle: 'compressed'
				}));
		}

		// dev build
		else{
			s = s.pipe(sourcemaps.init())
				.pipe(sass())
				.pipe(sourcemaps.write());
		}

		// destination
		s = s.pipe(gulp.dest(dest));

	}

	// no operation
	if(config.stylesheets.length == 0){
		s = gulp.src('.').pipe(gutil.noop());
	}

	// done
	return s;

});

// scripts
gulp.task('scripts', function(production){

	// init stream
	let s;

	// each script operation
	for(let script of config.scripts){

		// get path
		let path = script.split('>');
		if(path.length != 2){
			break;
		}
		let src = path[0].trim();
		let dest = path[1].trim();
		dest = dest.split('/');
		let file = dest.pop();
		dest = dest.join('/');

		// webpack config
		let wpconfig = {
			output: {
				filename: file
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

		// [--production]
		if(production){
			wpconfig.module.loaders[0].query.presets = ['babili'];
		}

		// webpack
		s = gulp.src(src).pipe(webpack(wpconfig));

		// destination
		s = s.pipe(gulp.dest(dest));

	}

	// no operation
	if(config.scripts.length == 0){
		s = gulp.src('.').pipe(gutil.noop());
	}

	// done
	return s;

});

// copy files
gulp.task('copy', function(){

	// init stream
	let s;

	// each copy operation
	for(let copy of config.copy){

		// get path
		let path = copy.split('>');
		if(path.length != 2){
			break;
		}
		let src = path[0].trim();
		let dest = path[1].trim();

		// copy
		gulp.src(src).pipe(gulp.dest(dest));

	}

	// no operation
	if(config.stylesheets.length == 0){
		s = gulp.src('.').pipe(gutil.noop());
	}

	// done
	return s;

});

// deploy
gulp.task('deploy', ['stylesheets', 'scripts'], function(production){

	// config
	let deploy = production ? config.deploy.production : config.deploy.development;

	// ftp
	if(deploy.type == 'ftp'){

		// connection configuration
		deploy.connect.parallel = 10;
		deploy.connect.log = gutil.log;

		// create ftp connection
		let conn = ftp.create(deploy.connect);

		// deploy
		return gulp.src(deploy.src, { base: '.', buffer: false })
			.pipe(conn.newer(deploy.dest))
			.pipe(conn.dest(deploy.dest));

	}

	// sftp
	else if(deploy.type == 'sftp'){

		// connection configuration
		deploy.connect.remotePath = deploy.dest;

		// deploy
		return gulp.src(deploy.src)
			.pipe(sftp(deploy.connect));

	}

	// file
	else if(deploy.type == 'file'){

		// deploy
		return gulp.src(deploy.src)
			.pipe(changed(deploy.dest))
			.pipe(using())
			.pipe(gulp.dest(deploy.dest));

	}

	// no operation
	else{
		return gulp.src('.').pipe(gutil.noop());
	}

});

// default
gulp.task('default', ['deploy']);
