# webpack-concat-files-plugin
Concatenate and transform files using Webpack

[![NPM](https://nodei.co/npm/webpack-concat-files-plugin.png)](https://nodei.co/npm/webpack-concat-files-plugin/)

## Installation
Install the plugin with npm:
```shell
$ npm install webpack-concat-files-plugin --save-dev
```

## Basic Usage
The example below concatenates all JavaScript files found within a hypothetical
`scripts/polyfills` directory, and outputs the bundled file to
`dist/polyfills.min.js`.

```js
const WebpackConcatPlugin = require('webpack-concat-files-plugin');

const webpackConfig = {
  entry: 'index.js',
  output: {
    path: 'dist',
    filename: 'index_bundle.js',
  },
  plugins: [
    new WebpackConcatPlugin({
      bundles: [
        {
          destination: './dist/polyfills.min.js',
          source: './scripts/polyfills/**/*.js',
        },
      ],
    }),
  ],
};
```

## Transformations
The contents of concatenated files can be modified (e.g., using minifiers and
transpilers) and used in the concatenated output. These modifications are
called transformations.

Each bundle can specify a `transforms` property, which can contain a
`before` callback and an `after` callback. The `before` callback is called
on each file before it is concatenated, and the `after` callback is called
after concatenation has occurred.

The example below demonstrates how [Terser](https://www.npmjs.com/package/terser)
could be used to minify the output of a concatenated bundle.

```js
const terser = require('terser');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');

const webpackConfig = {
  ...
  plugins: [
    new WebpackConcatPlugin({
      bundles: [
        {
          destination: './dist/polyfills.min.js',
          source: './scripts/polyfills/**/*.js',
          transforms: {
            after: (code) => {
              return terser.minify(code).code;
            },
          },
        },
      ],
    }),
  ],
};
```

## Options
The `options` object can contain the following properties:

* `bundles`: (_Array_) List of bundle objects
* `separator`: (_String_) Separator inserted between concatenated content (Optional, default `'\n'`)
* `allowWatch`: (_Boolean_) Determines whether bundles should be watched and automatically concatenated when using Webpack's watch mode (Optional, default `true`)

### Bundles
Each object specified in the `bundles` array can contain the following
properties:

* `destination`: (_String_) Output path for concatenated file.
* `source`: (_String_ or _Array_) Glob string or array of glob strings describing files to concatenate.
* `transforms`: (_Object_) Object describing transformations of concatenated files. (Optional)
* `encoding`: (_String_) Encoding to use when reading files. (Optional, default `'utf8'`)

### Transforms
The object specified for each `transforms` bundle property can contain the
following properties:

* `before(content, filepath)`: (_Callback_) Function to apply changes to file contents before concatenation. Accepts two string parameters: the contents of the file being concatenated, and the path to the file being concatenated. The string returned by this function is used for the concatenated output. (Optional)
* `after(content)`: (_Callback_) Callback function to apply changes to file contents after concatenation. Accepts a single string parameter containing the contents of the concatenated files, and the string returned by this function is used as the final concatenation output. (Optional)
