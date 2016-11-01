# Propeller
Propeller is a simple and lightweight Gulp plugin that allows you to compile and deploy your projects using easy-to-read configuration files. **Compilers** are used to build your project, while **deployers** are used to push files to both local and remote environments.

## Getting Started
Install Propeller using [npm](https://www.npmjs.com/get-npm):
```
npm install gulp-propeller --save-dev
```

Once installed, create a `propeller.json` file in your project directory:
```javascript
{
  "tasks": [
    "sass: scss/**/*.scss > build/css",
    "webpack: js/app.js > build/js/bundle.js"
  ]
}
```

With a configuration file in place, use Propeller in any [Gulp](http://gulpjs.com/) task:
```javascript
const gulp = require('gulp');
const propeller = require('gulp-propeller');

gulp.task('default', function(){

  // run propeller tasks
  propeller.run();

});
```



## Compilers
Compilers are used to build your project in preparation for deployment.


### Compiler Configuration
Configure compilers for your project by adding a `tasks` array to your `propeller.json` file. Tasks are formatted as `compiler: source > destination`. For example:
```javascript
{
  "tasks": [
    "sass: scss/app.scss > public/css"
  ]
}
```
In this example, we define one task in which the `sass` compiler is given a source of `scss/app.scss` and a destination of `public/css`. The Sass compiler will process all source files and place the compiled CSS files into the destination directory.


### Running Compiler Tasks
With tasks now configured in the `propeller.json` file, run all tasks in sequential order using `propeller.run()`:
```javascript
const gulp = require('gulp');
const propeller = require('gulp-propeller');

gulp.task('default', function(){

  // run propeller tasks
  propeller.run();

});
```


### Core Compilers
Propeller includes several core compilers that are available by default.

#### Sass Compiler (`sass:`)
Compiles [Sass](http://sass-lang.com/) stylesheets to CSS.

##### Examples
```javascript
{
  "tasks": [
    "sass: scss/app.scss > public/css",  // compile a single file
    "sass: scss/*.scss > public/css",    // compile multiple files
    "sass: scss/**/*.scss > public/css", // compile multiple files recursively
  ]
}
```

##### Production Build
Compiled CSS files include Sass sourcemaps and full-length CSS styles. When in _production mode_, the Sass compiler uses [gulp-autoprefix](https://www.npmjs.com/package/gulp-autoprefixer) to automatically add browser prefixes to your CSS styles, and also minifies and compresses your CSS for optimal performance. For production builds, run gulp using the `--production` flag.

#### Webpack Compiler (`webpack:`)
Compiles your ES6 JavaScript files into client-ready ES5 JavaScript using the [Babel](https://babeljs.io/) plugin for [webpack](https://webpack.github.io/). The task `source` should indicate the webpack _entry_ file, and the task `destination` should include the bundle file name.

##### Examples
```javascript
{
  "tasks": [
    "webpack: es6/entry.js > public/js/bundle.js" // compile entry.js to bundle.js
  ]
}
```

##### Production Build
The webpack compiler generates rather verbose JavaScript file bundles. When in _production mode_, [Babili](https://github.com/babel/babili) is used to minify the compiled files for better performance. For production builds, run gulp using the `--production` flag.

#### Copy Compiler (`copy:`)
Copy files from one location to another. This can be useful for automating the movement of NPM module assets (such as fonts and icons) into your project.

##### Examples
```javascript
{
  "tasks": [
    "copy: source/index.html > public/html", // copy a single file
    "copy: source/* > public/html",          // copy multiple files
    "copy: source/** > public/html"          // copy multiple files recursively
  ]
}
```



## Deployers
Deployers are used to move project files to a target environment.


### Deployer Configuration
Configure deployers for your project by adding an `environments` object to your `propeller.json` file. List environments by specifying an environment name, type, source, and destination:
```javascript
{
  "environments": {
    "local": {
      "type": "file",
      "src": "build/**",
      "dest": "public/html"
    }
  }
}
```
In this example, we define one environment called `local`, using the `file` deployer.


### Running Deployments
With an environment now configured in the `propeller.json` file, deployments can be run using `propeller.deploy()`:
```javascript
const gulp = require('gulp');
const propeller = require('gulp-propeller');

gulp.task('default', function(){

  // deploy to 'local' environment
  propeller.deploy('local');

});
```

Note that deployments can be chained together with compiler tasks so that they are executed after all tasks have completed. For example:
```javascript
propeller.run().deploy('local').deploy('staging');
```


### Core Deployers
Propeller includes several core deployers that are available by default.

#### File Deployer (`type:file`)
Deploy assets using the file system.

##### Examples
###### `propeller.json`
```javascript
{
  "environments": {
    "web1": {
      "type": "file",
      "src": "public/**",
      "dest": "/volumes/nas-web/public_html"
    }
  }
}
```
###### `gulpfile.js`
```javascript
propeller.deploy('web1');
```

#### FTP Deployer (`type:ftp`)
Deploy assets using the file transfer protocol (FTP). This deployer requires a `connection` object to be included in the environment definition within `propeller.json` (see below for examples).

Note that the FTP deployer utilizes [vinyl-ftp](https://www.npmjs.com/package/vinyl-ftp) to handle file transfers. Refer to [https://www.npmjs.com/package/vinyl-ftp#ftpcreate-config-](https://www.npmjs.com/package/vinyl-ftp#ftpcreate-config-) for additional connection configuration options.

##### Examples
###### `propeller.json`
```javascript
{
  "environments": {
    "staging": {
      "type": "ftp",
      "src": "public/**",
      "dest": "public_html/staging",
      "connection": {
        "host": "staging.somedomain.com",
        "user": "kyle",
        "pass": "mypassword",
        "secure": true,
        "port": 21
      }
    }
  }
}
```
###### `gulpfile.js`
```javascript
propeller.deploy('staging');
```

#### SFTP Deployer (`type:sftp`)
Deploy assets using the secure file transfer protocol (SFTP). This deployer requires a `connection` object to be included in the environment definition within `propeller.json` (see below for examples).

Note that the SFTP deployer utilizes [gulp-sftp](https://www.npmjs.com/package/gulp-sftp) to handle file transfers. Refer to [https://www.npmjs.com/package/gulp-sftp#api](https://www.npmjs.com/package/gulp-sftp#api) for additional connection configuration options.

##### Examples
###### `propeller.json`
```javascript
{
  "environments": {
    "production": {
      "type": "sftp",
      "src": "public/**",
      "dest": "public_html/www",
      "connection": {
        "host": "somedomain.com",
        "user": "kyle",
        "pass": "mypassword",
        "port": 22
      }
    }
  }
}
```
###### `gulpfile.js`
```javascript
propeller.deploy('production');
```



## Extending Propeller
Propeller is built to be highly extensible. Write custom compilers and deployers to add new capabilities to your Propeller projects.


### Custom Compilers
Extend `propeller.Compiler` and pass an instance of your extended class to `propeller.extend()` to register a custom Propeller compiler.
```javascript
const gulp = require('gulp');
const propeller = require('gulp-propeller');

// move compiler
class Move extends propeller.Compiler {
  compile(src, dest){
    return gulp.src(src).pipe(gulp.dest(dest));
  }
}

// extend propeller
propeller.extend(new Move());
```

Custom compilers should include a `compile()` method that returns a Gulp stream object upon closure.

Utilize custom compilers by adding them to your task list. Always use the _lower-case class name_ of your custom compiler when creating tasks. For example, the custom `Move` compiler becomes `move:` in our `propeller.json` task list:
```javascript
{
  "tasks": [
    "move: source/file.txt > destination"
  ]
}
```


### Custom Deployers
Extend `propeller.Deployer` and pass an instance of your extended class to `propeller.extend()` to register a custom Propeller deployer.
```javascript
const gulp = require('gulp');
const propeller = require('gulp-propeller');

// webdav deployer
class WebDav extends propeller.Deployer {
  deploy(src, dest, connection){
    return gulp.src(src).pipe(gulp.dest(dest));
  }
}

// extend propeller
propeller.extend(new WebDav());
```

Custom deployers should include a `deploy()` method that returns a Gulp stream object upon closure. Optionally employ the `connection` parameter in the `deploy` method to pass custom JSON configuration data to your deployer.

Utilize custom deployers by referring to them in your environments list. Always use the _lower-case class name_ of your deployer in configuration files. For example, the custom `WebDav` deployer becomes `webdav` in our `propeller.json` environments list:
```javascript
{
  "environments": {
    "staging1": {
      "type": "webdav",
      "src": "public/**",
      "dest": "public_html/staging1",
      "connection": {
        "key1": "value1",
        "key2": "value2"
      }
    }
  }
}
```
