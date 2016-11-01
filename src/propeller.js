const gutil = require('gulp-util');
const through = require('through2');
const PLUGIN_NAME = 'Propeller';

/**
 * Propeller
 */
class Propeller {

	/**
	 * Default configuration settings
	 *
	 * @type {Object}
	 */
	constructor(){

		// settings
		this.settings = {
			configFile: './propeller.json',
			compilers: {},
			deployers: {},
			tasks: [],
			environments: {},
			production: !!gutil.env.production,
			tasksRunning: false,
			queueDeploy: [],
		};

		// init
		this.init();

	}

	/**
	 * Initialize Propeller
	 */
	init(){

		// load core extensions
		this.loadCoreExtensions();

		// load configuration file
		this.loadConfigFile(this.settings.configFile);

	}

	/**
	 * Load core extensions
	 */
	loadCoreExtensions(){

		// load base classes for use in 3rd party extensions
		this.Compiler = require('./compilers/compiler.js');
		this.Deployer = require('./deployers/deployer.js');

		// core compilers
		this.extend(require('./compilers/copy.js'));
		this.extend(require('./compilers/sass.js'));
		this.extend(require('./compilers/webpack.js'));

		// core deployers
		this.extend(require('./deployers/file.js'));
		this.extend(require('./deployers/ftp.js'));
		this.extend(require('./deployers/sftp.js'));

	}

	/**
	 * Extend Propeller with a new Compiler or Deployer
	 *
	 * @param {Object} extension
	 */
	extend(extension){

		// load new Compiler
		if(Object.getPrototypeOf(extension.constructor).name == 'Compiler'){
			this.settings.compilers[extension.constructor.name.toLowerCase()] = extension;
		}

		// load new Deployer
		else if(Object.getPrototypeOf(extension.constructor).name == 'Deployer'){
			this.settings.deployers[extension.constructor.name.toLowerCase()] = extension;
		}

	}

	/**
	 * Load configuration from JSON object
	 *
	 * @param {Object} config
	 */
	configure(config){
		if(config) Object.assign(this.settings, config);
	}

	/**
	 * Load configuration file
	 *
	 * @param {string} path
	 */
	loadConfigFile(path){

		// set path relative to current working directory
		path = `${process.cwd()}/${path}`;

		// log
		gutil.log('Using Propeller file', gutil.colors.magenta(path));

		// configure
		this.configure(require(path));

	}

	/**
	 * Parse compiler task data
	 *
	 * @param {string} task
	 * @return {Object}
	 */
	parseTask(task){

		// get path ("compiler: src > dest")
		let path = task.split(/:|>/);

    // invalid task
    if(path.length != 3) return false;

		// task data
		return {
			'compiler': path[0].trim().toLowerCase(),
			'src': path[1].trim(),
			'dest': path[2].trim()
		};

	}

	/**
	 * Run a task
	 * Returns a Gulp stream
	 *
	 * @param {string} task
	 * @param {function} next
	 * @return {Object} stream
	 */
	runTask(task, next){

		// log
		gutil.log('Propeller task:', gutil.colors.blue(task));

		// get operation details
		let operation = this.parseTask(task);

		// invalid task
		if(!operation) throw new gutil.PluginError(PLUGIN_NAME, `Task '${task}' is invalid`);

		// invalid compiler
		if(!this.settings.compilers[operation.compiler]) throw new gutil.PluginError(PLUGIN_NAME, `Compiler '${operation.compiler}' not found`);

		// run task
		return this.settings.compilers[operation.compiler].run(operation, next);

	}

	/**
	 * Run next compiler task
	 */
	run(){

		// have tasks?
		if(this.settings.tasks.length){

			// running tasks
			this.settings.tasksRunning = true;

			// get next task
			let task = this.settings.tasks.shift();

			// run
			this.runTask(task, this);

		}

		// done
		else{

			// complete
			gutil.log(gutil.colors.blue('Propeller tasks completed.'));

			// deployment queued?
			if(this.settings.queueDeploy.length){
				this.runDeploy();
			}

		}

		// return propeller for chaining
		return this;

	}

	/**
	 * Queue deployment to target environment
	 *
	 * @param {string} environment
	 */
	deploy(environment){

		// no environment
		if(!environment) throw new gutil.PluginError(PLUGIN_NAME, `Please specify an environment when deploying`);

		// queue deployment
		this.settings.queueDeploy.push(environment);

		// deploy immediately?
		if(!this.settings.tasksRunning){
			this.runDeploy();
		}

		// return propeller for chaining
		return this;

	}

	/**
	 * Run next queued deployment task
	 */
	runDeploy(){

		// have queued deployments?
		if(this.settings.queueDeploy.length){

			// get next queued deployment
			let environment = this.settings.queueDeploy.shift();

			// log
			gutil.log('Propeller deploy:', gutil.colors.blue(environment));

			// invalid environment
			if(!this.settings.environments[environment]) throw new gutil.PluginError(PLUGIN_NAME, `Environment '${environment}' not found in propeller file`);

			// get environment configuration
			let env = this.settings.environments[environment];

			// invalid deployer
			if(!this.settings.deployers[env.type]) throw new gutil.PluginError(PLUGIN_NAME, `Deployer '${env.type}' not found`);

			// deploy
			return this.settings.deployers[env.type].run(env, this);

		}

		// done
		else{
			gutil.log(gutil.colors.blue('Propeller deployments completed.'));
		}

	}

}

module.exports = new Propeller();
