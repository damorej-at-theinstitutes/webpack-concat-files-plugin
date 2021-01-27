const { replacePathSeparator, restorePathSeparator } = require('../../../src/util/path-separators.js');

const path = require('path');
const chai = require('chai');
const expect = chai.expect;

/*
 * Tests for replacePathSeparator() function.
 */
describe('replacePathSeparator()', function() {

  // Ensure that expected path is output.
  it('returns a string with path separators replaced', function() {
    const filepath = path.join('my', 'path', 'to', 'a', 'file.txt');

    const pathA = replacePathSeparator(filepath, '/');
    const pathB = replacePathSeparator(filepath, '\\');
    const pathC = replacePathSeparator(filepath, '-');

    //expect(pathA).to.equal('my/path/to/a/file.txt');
    expect(pathB).to.equal('my\\path\\to\\a\\file.txt');
    expect(pathC).to.equal('my-path-to-a-file.txt');
  });

});

/*
 * Tests for restorePathSeparator() function.
 */
describe('restorePathSeparator()', function() {

  // Ensure that expected path is output.
  it('returns a string with path separators restored', function() {
    const filepathControl = path.join('my', 'path', 'to', 'a', 'file.txt');
    const filepathA = 'my/path/to/a/file.txt';
    const filepathB = 'my\\path\\to\\a\\file.txt';
    const filepathC = 'my-path-to-a-file.txt';

    const pathA = restorePathSeparator(filepathA, '/');
    const pathB = restorePathSeparator(filepathB, '\\');
    const pathC = restorePathSeparator(filepathC, '-');

    expect(pathA).to.equal(filepathControl);
    expect(pathB).to.equal(filepathControl);
    expect(pathC).to.equal(filepathControl);
  });
});
