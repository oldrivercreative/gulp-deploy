const gutil = require('gulp-util');
const PLUGIN_NAME = 'Propeller';

class Compiler {

  /**
   * Compile source to destination:
   * Override this method to write your own compiler.
   * Return a Gulp stream to properly close this method.
   *
   * @param {string|array} src
   * @param {string} dest
   * @return {Object} stream
   */
  compile(src, dest){
    //
  }

  /**
   * Run compiler task
   *
   * @param {Object} operation
   * @param {Object} propeller
   * @return {Object} stream
   */
  run(operation, propeller){

    // no operation
    if(!operation){
      throw new gutil.PluginError(PLUGIN_NAME, `Task failed to run: no operation given`);
    }

    // compile
    let stream = this.compile(operation.src, operation.dest);

    // next
    stream.on('end', function(){
      propeller.run();
    });

    // return stream
    return stream;

  }

}

module.exports = Compiler;
