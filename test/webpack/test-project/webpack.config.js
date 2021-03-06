const path = require('path');
const fs = require('fs');
const ConcatFilesPlugin = require('../../../src/index.js');

/**
 * Basic Webpack configuration that works for v4 and v5.
 *
 * Plugin config is injected on a test-by-test basis.
 */
module.exports = {
  mode: 'production',
  entry: {
    main: path.resolve(__dirname, 'src', 'index.js'),
  },
  name: 'test-project',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test-project.bundle.js',
  },
  plugins: [
    new ConcatFilesPlugin({
      bundles: [
        // Basic concatenation.
        {
          src: path.resolve(__dirname, './src/concat-files/a/**/*.js'),
          dest: path.resolve(__dirname, 'dist/concat-files/concat-a.js'),
        },
        // Test 'src' as an array.
        {
          src: [
            path.resolve(__dirname, './src/concat-files/d/**/*.js'),
            path.resolve(__dirname, './src/concat-files/e/**/*.js'),
          ],
          dest: path.resolve(__dirname, 'dist/concat-files/concat-d.js'),
        },
        // Test `transforms` property.
        {
          src: path.resolve(__dirname, './src/concat-files/b/**/*.js'),
          dest: path.resolve(__dirname, 'dist/concat-files/concat-b.js'),
          transforms: {
            before: (content, filepath) => {
              return `/* COMMENT */${content}`;
            },
            after: (content) => {
              return content.replace(/(\r\n|\n|\r)/gm, '');
            },
          },
        },
        // Test `transforms` property with filepath argument.
        {
          src: path.resolve(__dirname, './src/concat-files/f/**/*.js'),
          dest: path.resolve(__dirname, 'dist/concat-files/concat-f.js'),
          transforms: {
            before: (content, filepath) => {
              return `/* ${filepath} */${content}`;
            },
          },
        },
      ],
    }),
    new ConcatFilesPlugin({
      separator: '/* ENDFILE */\n',
      bundles: [
        {
          // Test `separator` property.
          src: path.resolve(__dirname, 'src/concat-files/c/**/*.js'),
          dest: path.resolve(__dirname, 'dist/concat-files/concat-c.js'),
        },
      ],
    }),
  ],
};
