const gulp = require('gulp');
const propeller = require('../src/propeller.js');

gulp.task('default', function(){

  // run propeller tasks
  propeller.run().deploy('local');

});
