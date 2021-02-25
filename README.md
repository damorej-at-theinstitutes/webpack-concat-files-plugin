# webpack-concat-files-plugin
Concatenate and transform files using Webpack

[![NPM](https://nodei.co/npm/webpack-concat-files-plugin.png)](https://nodei.co/npm/webpack-concat-files-plugin/)

## Installation
Install the plugin with npm:
```shell
$ npm install webpack-concat-files-plugin --save-dev
```

## Basic Usage
The example below concatenates all JavaScript files found within a hypothetical `scripts/polyfills` directory, and outputs the bundled file to `dist/polyfills.min.js`.

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
          dest: './dist/polyfills.min.js',
          src: './scripts/polyfills/**/*.js',
        },
      ],
    }),
  ],
};
```

## Transformations
The contents of concatenated files can be modified (e.g., using minifiers and transpilers) and used in the concatenated output. These modifications are called transformations.

Each bundle can specify a `transforms` property, which can contain a `before` callback and an `after` callback. The `before` callback is called on each file before it is concatenated, and the `after` callback is called after concatenation has occurred.

The example below demonstrates how [Terser](https://www.npmjs.com/package/terser) could be used to minify the output of a concatenated bundle.

```js
const terser = require('terser');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');

const webpackConfig = {
  // ...
  plugins: [
    new WebpackConcatPlugin({
      bundles: [
        {
          src: './scripts/polyfills/**/*.js',
          dest: './dist/polyfills.min.js',
          transforms: {
            after: async (code) => {
              const minifiedCode = await terser.minify(code);
              return minifiedCode.code;
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
* `allowOptimization`: (_Boolean_) Determines whether Webpack should optimize concatenated bundles according to its optimization configuration. Webpack 5 only. (Optional, default `false`)

### Bundles
Each object specified in the `bundles` array can contain the following properties:

* `bundle.src`: (_String_ or _Array_) Glob string or array of glob strings describing files to concatenate.
* `bundle.dest`: (_String_) Output path for concatenated file.
* `bundle.transforms`: (_Object_) Object describing transformations of concatenated files. (Optional)
* `bundle.encoding`: (_String_) Encoding to use when reading files. (Optional, default `'utf8'`)

### Transforms
The object specified for each `transforms` bundle property can contain any of the following properties:

* `transform.before(content, filepath)`: (_Callback_) Function to apply changes to file contents before concatenation. Accepts two string parameters: the contents of the file being concatenated, and the path to the source file being concatenated. The string returned by this function is used for the concatenated output. (Optional)
* `transform.after(content)`: (_Callback_) Function to apply changes to file contents after concatenation. Accepts a single string parameter containing the contents of the concatenated files, and the string returned by this function is used as the final concatenation output. (Optional)

### Deprecated Options
The following options have been deprecated and will be removed in a future release:

* `bundle.source`: (_String_ or _Array_) Replaced with `bundle.src`. See documentation above.
* `bundle.destination`: (_String_) Replaced with `bundle.dest`. See documentation above.

## Compatibility
`webpack-concat-files-plugin` is compatible with Webpack 4 and Webpack 5:

| Webpack 4           | Webpack 5        |
| ------------------- | ---------------- |
| `4.40.x` or greater | `5.x` or greater |

## Contributors
Special thanks to everybody who's contributed to this project!

| [@davidwarrington](https://github.com/davidwarrington) | [@Iszacsuri](https://github.com/lszacsuri) | [@jarrettgreen](https://github.com/jarrettgreen) | [@wagoid](https://github.com/wagoid)
|-|-|-|-|
