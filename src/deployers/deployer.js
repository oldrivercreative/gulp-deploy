const gutil = require('gulp-util');
const PLUGIN_NAME = 'Propeller';

class Deployer {

  /**
   * Deploy source to destination:
   * Override this method to write your own deployer.
   * The connection parameter is optional.
   * Return a Gulp stream to properly close this method.
   *
   * @param {string} src
   * @param {string} dest
   * @param {Object} connection
   * @param {boolean} gitignore
   * @return {Object} stream
   */
  deploy(src, dest, connection, gitignore){
    //
  }

  /**
   * Run deployer task
   *
   * @param {Object} environment
   * @param {Object} propeller
   */
  run(environment, propeller){

    // no environment
    if(!environment) throw new gutil.PluginError(PLUGIN_NAME, `Deploy failed to run: no environment given`);

    // deploy
    let stream = this.deploy(environment.src, environment.dest, environment.connection ? environment.connection : false, environment.gitignore ? true : false);

    // next
    stream.on('end', function(){
      propeller.runDeploy();
    });

  }

}

module.exports = Deployer;
