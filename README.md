# Propeller
[![GitHub issues](https://img.shields.io/github/issues/oldrivercreative/propeller.svg)](https://github.com/oldrivercreative/propeller/issues) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/oldrivercreative/propeller/master/LICENSE) [![Twitter](https://img.shields.io/twitter/url/https/github.com/oldrivercreative/propeller.svg?style=social)](https://twitter.com/intent/tweet?text=%23propeller&url=https%3A%2F%2Fgithub.com%2Foldrivercreative%2Fpropeller)

Propeller is a simple and lightweight [Gulp](http://gulpjs.com/) plugin that allows you to compile and deploy your projects using easy-to-read configuration files. **Compilers** are used to build your project, while **deployers** are used to push files to both local and remote environments.

### Getting Started
Install Propeller using [npm](https://www.npmjs.com/get-npm):
```sh
npm install gulp-propeller --save-dev
```

Create a `propeller.json` file in your project directory:
```json
{
  "tasks": [
    "sass: scss/**/*.scss > build/css",
    "webpack: es6/entry.js > build/js/bundle.js"
  ],
  "environments": {
    "local": {
      "type": "file",
      "src": "build/**",
      "dest": "public/assets"
    }
  }
}
```

Use Propeller in any Gulp task:
```js
const gulp = require('gulp');
const propeller = require('gulp-propeller');

gulp.task('default', function(){

  // run propeller tasks, then deploy to 'local' environment
  propeller.run().deploy('local');

});
```

# Compilers
Compilers are used to build your project in preparation for deployment. Configure compilers by adding `tasks` to your `propeller.json` file:
```json
{
  "tasks": [
    "sass: scss/app.scss > public/css",
    "webpack: es6/entry.js > public/js/bundle.js"
  ]
}
```

Run all tasks in sequential order using `propeller.run`:
```js
propeller.run();
```

Some compilers may yield a different output when in _production mode_. For example, a production build may include minified files for optimized performance. Run gulp tasks with the `--production` flag to enable production mode in all Propeller compilers.

### Core Compilers
Propeller includes several core compilers that are available by default.

---

#### `concat` Compiler
Concatenate files into a single file at the target location. Use a comma-separated array syntax to specify all source files in order.

###### Configuration
```json
{
  "tasks": [
    "concat: [ js/one.js, js/two.js ] > public/js/all.js"
  ]
}
```

---

#### `copy` Compiler
Copy files from one location to another.

###### Configuration
```json
{
  "tasks": [
    "copy: source/icons.otf > public/fonts"
  ]
}
```

---

#### `sass` Compiler
Compile [Sass](http://sass-lang.com/) stylesheets to CSS.

###### Configuration
```json
{
  "tasks": [
    "sass: scss/app.scss > public/css"
  ]
}
```

###### Production Mode
By default, compiled CSS stylesheets include Sass sourcemaps and expanded CSS style declarations. In _production mode_, the Sass compiler uses [gulp-autoprefix](https://www.npmjs.com/package/gulp-autoprefixer) to automatically add vendor prefixes to your CSS styles. In addition, the CSS output is compressed and minified for optimal performance.

---

#### `webpack` Compiler
Compile ES6 files into client-ready ES5 using the [Babel](https://babeljs.io/) preset for [webpack](https://webpack.github.io/).

###### Configuration
```json
{
  "tasks": [
    "webpack: es6/entry.js > public/js/bundle.js"
  ]
}
```

###### Production Mode
[Babili](https://github.com/babel/babili) is used in _production mode_ to minify the compiled scripts for better performance.

# Deployers
Deployers are used to move project files to a target environment. Configure deployers by adding `environments` to your `propeller.json` file:
```json
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

Deploy to a target environment using `propeller.deploy`:
```js
propeller.deploy('local');
```

Chain deployments to compiler tasks to create a sequential build/deploy sequence:
```js
propeller.run().deploy('local').deploy('staging');
```

### Core Deployers
Propeller includes several core deployers that are available by default.

---

#### `file` Deployer
Deploy assets using the file system.

###### Configuration
```json
{
  "environments": {
    "web1": {
      "type": "file",
      "src": "public/**",
      "dest": "/volumes/web1/public_html"
    }
  }
}
```

---

#### `ftp` Deployer
Deploy assets using the file transfer protocol (FTP). This deployer requires a `connection` object to be included in the environment definition within `propeller.json` (see below for examples).

The FTP deployer utilizes [vinyl-ftp](https://www.npmjs.com/package/vinyl-ftp) to handle file transfers. See [https://www.npmjs.com/package/vinyl-ftp#ftpcreate-config-](https://www.npmjs.com/package/vinyl-ftp#ftpcreate-config-) for additional connection configuration options.

###### Configuration
```json
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

---

#### `sftp` Deployer
Deploy assets using the secure file transfer protocol (SFTP). This deployer requires a `connection` object to be included in the environment definition within `propeller.json` (see below for examples).

The SFTP deployer utilizes [gulp-sftp](https://www.npmjs.com/package/gulp-sftp) to handle file transfers. See [https://www.npmjs.com/package/gulp-sftp#api](https://www.npmjs.com/package/gulp-sftp#api) for additional connection configuration options.

###### Configuration
```json
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

# Extending Propeller
Propeller is built to be highly extensible. Create custom compilers and deployers to add new capabilities to your Propeller projects.

### Custom Compilers
Extend `propeller.Compiler` and pass an instance of your extended class to `propeller.extend` to register a custom compiler.
```js
const gulp = require('gulp');
const propeller = require('gulp-propeller');

class Coffee extends propeller.Compiler {

  /**
   * Compile source to destination:
   * Override this method to write your own compiler.
   * Return a Gulp stream to properly close this method.
   *
   * @param {string} src
   * @param {string} dest
   * @return {Object} stream
   */
  compile(src, dest){

    // do stuff

  }

}

// extend propeller
propeller.extend(new Coffee());
```

Custom compilers should include a `compile` method that returns a Gulp stream object upon closure.

Utilize custom compilers by adding them to your task list. Always use the _lower-case class name_ of your custom compiler when creating tasks. For example, the custom `Coffee` compiler becomes `coffee` in our `propeller.json` task list:
```json
{
  "tasks": [
    "coffee: source/file.coffee > destination"
  ]
}
```

### Custom Deployers
Extend `propeller.Deployer` and pass an instance of your extended class to `propeller.extend` to register a custom deployer.
```js
const gulp = require('gulp');
const propeller = require('gulp-propeller');

class WebDav extends propeller.Deployer {

  /**
   * Deploy source to destination:
   * Override this method to write your own deployer.
   * The connection parameter is optional.
   * Return a Gulp stream to properly close this method.
   *
   * @param {string} src
   * @param {string} dest
   * @param {Object} connection
   * @return {Object} stream
   */
  deploy(src, dest, connection){

    // do stuff

  }

}

// extend propeller
propeller.extend(new WebDav());
```

Custom deployers should include a `deploy` method that returns a Gulp stream object upon closure. Optionally employ the `connection` parameter in the `deploy` method to pass custom JSON configuration data to your deployer.

Utilize custom deployers by referring to them in your environments list. Always use the _lower-case class name_ of your deployer in configuration files. For example, the custom `WebDav` deployer becomes `webdav` in our `propeller.json` environments list:
```json
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
