const ConcatenationItem = require('../../src/concatenation-item.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const path = require('path');

chai.use(chaiAsPromised);
const expect = chai.expect;

/*
 * Tests describing ConcatenationItem class.
 */
describe('ConcatenationItem', function() {

  /*
   * Tests for ConcatenationItem::constructor().
   */
  describe('#constructor()', function() {
    let concatenationItem;

    // Create ConcatenationItem instance for testing.
    before(function() {
      concatenationItem = new ConcatenationItem('Hello, world!', './test/file/path.js');
    });

    // Ensure `content` property is set correctly.
    it('sets the `content` property', function() {
      expect(concatenationItem.content).to.equal('Hello, world!');
    });

    // Ensure `filepath` property is set correctly.
    it('sets the `filepath` property', function() {
      expect(concatenationItem.filepath).to.equal('./test/file/path.js');
    });
  });

  /*
   * Tests for ConcatenationItem::loadFromFileSync().
   */
  describe('#loadFromFileSync()', function() {

    // Ensure that a ConcatenationItem instance is returned with expected properties.
    it('returns a `ConcatenationItem` instance with correct `content` and `filepath` properties', function() {
      const filepath = path.join(__dirname, './test-files/a.txt');
      const item = ConcatenationItem.loadFromFileSync(filepath, 'utf8');
      expect(item.content).to.equal('Hello, world A!\n');
      expect(item.filepath).to.equal(filepath);
    });

    // Ensure that `ENOENT` error is thrown if filepath is invalid.
    it('throws an ENOENT error if filepath is invalid', function() {
      const filepath = path.join(__dirname, './test-files/d.txt'); // No file exists at this path.
      const cb = function() {
        ConcatenationItem.loadFromFileSync(filepath, 'utf8');
      };
      expect(cb).to.throw('ENOENT');
    });

  });

  /*
   * Tests for ConcatenationItem::loadFromFile().
   */
  describe('#loadFromFile()', function() {

    // Ensure that function returns a `Promise` instance.
    it('returns a `Promise` instance', function() {
      const filepath = path.join(__dirname, './test-files/a.txt');
      const itemPromise = ConcatenationItem.loadFromFile(filepath, 'utf8');
      expect(itemPromise).to.be.a('promise');
    });

    // Ensure that promise resolves to ConcatenationItem instance with expected properties.
    it('resolves to a `ConcatenationItem` instance with correct `content` and `filepath` properties', function() {
      const filepath = path.join(__dirname, './test-files/a.txt');
      const itemPromise = ConcatenationItem.loadFromFile(filepath, 'utf8');
      const expected = new ConcatenationItem('Hello, world A!\n', filepath);
      return expect(itemPromise).to.eventually.deep.equal(expected);
    });

    // Ensure that promise rejects with `ENOENT` error if filepath is invalid.
    it('rejects with an `ENOENT` error if filepath is invalid', function() {
      const filepath = path.join(__dirname, './test-files/d.txt'); // No file exists at this path.
      const itemPromise = ConcatenationItem.loadFromFile(filepath, 'utf8');
      return expect(itemPromise).to.be.rejectedWith('ENOENT');
    });
  });
});
