const gutil = require('gulp-util');
const PLUGIN_NAME = 'Propeller';

/**
 * Propeller
 */
class Propeller {

	/**
	 * Default configuration settings
	 *
	 * @type {Object}
	 * @return {Propeller}
	 */
	constructor(){

		// settings
		this.settings = {
			configFile: './propeller.json',
			compilers: {},
			deployers: {},
			tasks: [],
			tasksComplete: [],
			environments: {},
			production: !!gutil.env.production,
			tasksRunning: false,
			queueDeploy: [],
		};

		// init
		this.init();

		return this;

	}

	/**
	 * Initialize Propeller
	 *
	 * @return {void}
	 */
	init(){

		// load core extensions
		this.loadCoreExtensions();

		// load configuration file
		this.loadConfigFile(this.settings.configFile);

	}

	/**
	 * Load core extensions
	 *
	 * @return {void}
	 */
	loadCoreExtensions(){

		// load base classes for use in 3rd party extensions
		this.Compiler = require('./compilers/compiler.js');
		this.Deployer = require('./deployers/deployer.js');

		// core compilers
		this.extend(require('./compilers/concat.js'));
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
	 * @return {Propeller}
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

		return this;

	}

	/**
	 * Load configuration from JSON object
	 *
	 * @param {Object} config
	 * @return {Propeller}
	 */
	configure(config){
		if(config) Object.assign(this.settings, config);
		return this;
	}

	/**
	 * Load configuration file
	 *
	 * @param {string} path
	 * @return {Propeller}
	 */
	loadConfigFile(path){

		// set path relative to current working directory
		path = `${process.cwd()}/${path}`;

		// log
		gutil.log('Using Propeller file', gutil.colors.magenta(path));

		// configure
		return this.configure(require(path));

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

		// parse src array
		path[1] = path[1].trim().replace(/^\s*\[\s*/, '').replace(/\s*\]\s*$/, '').split(/\s*,\s*/);

		// task data
		return {
			'compiler': path[0].trim().toLowerCase(),
			'src': path[1],
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
	 *
	 * @return {Propeller}
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

			// add to complete tasks
			this.settings.tasksComplete.push(task);

		}

		// done
		else{

			// complete
			gutil.log(gutil.colors.blue('Propeller tasks completed.'));

			// deployment queued?
			if(this.settings.queueDeploy.length){
				this.runDeploy();
			}

			// reset tasks queue
			this.settings.tasks = this.settings.tasksComplete;
			this.settings.tasksComplete = [];

		}

		return this;

	}

	/**
	 * Queue deployment to target environment
	 *
	 * @param {string} environment
	 * @return {Propeller}
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

		return this;

	}

	/**
	 * Run next queued deployment task
	 *
	 * @return {void}
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
