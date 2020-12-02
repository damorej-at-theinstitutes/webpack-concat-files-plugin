const fs = require('fs');
const path = require('path');

// List of files that should be included in the in-memory filesystem.
// Contents of files are retrieved from the filesystem, so a corresponding
// file should exist in the listed location.
const filesystem = [
  './test-project/src/index.js',
  './test-project/src/concat-files/a/1.js',
  './test-project/src/concat-files/a/2.js',
  './test-project/src/concat-files/a/3.js',
  './test-project/src/concat-files/b/1.js',
  './test-project/src/concat-files/b/2.js',
  './test-project/src/concat-files/c/1.js',
  './test-project/src/concat-files/c/2.js',
];

module.exports = filesystem.reduce((acc, cur) => {
  const currentPath = path.resolve(__dirname, cur);
  acc[currentPath] = fs.readFileSync(currentPath, 'utf8');
  return acc;
}, {});
