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
          source: path.resolve(__dirname, './src/concat-files/a/**/*.js'),
          destination: path.resolve(__dirname, 'dist/concat-files/concat-a.js'),
        },
        // Test `transforms` property.
        {
          source: path.resolve(__dirname, './src/concat-files/b/**/*.js'),
          destination: path.resolve(__dirname, 'dist/concat-files/concat-b.js'),
          transforms: {
            before: (content, filepath) => {
              return `/* COMMENT */${content}`;
            },
            after: (content) => {
              return content.replace(/(\r\n|\n|\r)/gm, '');
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
          source: path.resolve(__dirname, 'src/concat-files/c/**/*.js'),
          destination: path.resolve(__dirname, 'dist/concat-files/concat-c.js'),
        },
      ],
    }),
  ],
};
