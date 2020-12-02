const GlobHandler = require('../../src/glob-handler.js');
const ConcatenationItem = require('../../src/concatenation-item.js');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

/*
 * Tests for GlobHandler class.
 */
describe('GlobHandler', function() {

  /*
   * Tests for GlobHandler::constructor().
   */
  describe('#constructor()', function() {

    // Ensure `globs` property is set correctly when a single string is passed.
    it('sets the `globs` property correctly when a string is passed', function() {
      const globHandler = new GlobHandler('./test-files/**/*.txt');
      const expectedGlobProperty = ['./test-files/**/*.txt'];

      expect(globHandler.globs).to.be.an('array');
      expect(globHandler.globs).to.have.lengthOf(1);
      expect(globHandler.globs).to.eql(expectedGlobProperty);
    });

    // Ensure `globs` property is set correctly when an array of strings is passed.
    it('sets the `globs` property correctly when an array of strings is passed', function() {
      const globProperty = ['./test-files/**/*.txt', './test-files/**/*.js', './test-files/**/*.md'];
      const globHandler = new GlobHandler(globProperty);

      expect(globHandler.globs).to.be.an('array');
      expect(globHandler.globs).to.have.lengthOf(3);
      expect(globHandler.globs).to.eql(globProperty);
    });

    // Ensure `globs` property is set correctly when a falsy value is passed.
    it('sets the `globs` property to an empty array when no string is passed', function() {
      const globHandler = new GlobHandler();

      expect(globHandler.globs).to.be.an('array');
      expect(globHandler.globs).to.have.lengthOf(0);
    });
  });

  /*
   * Tests for GlobHandler::getConcatenationItems().
   */
  describe('#getConcatenationItems', function() {
    let globHandlerOutput;

    // Run GlobHandler::getConcatenationItems and store results for validation.
    before(function() {
      const glob = './test/unit/test-files/**/*.txt';
      const globHandler = new GlobHandler(glob);
      globHandlerOutput = globHandler.getConcatenationItems('utf8');
    });

    // Ensure `getConcatenationItems()` returns a promise.
    it('returns a `Promise` instance', function() {
      expect(globHandlerOutput).to.be.a('promise');
    });

    // Ensure `getConcatenationItems()` promise resolves to an array.
    it('resolves to an array', function() {
      return expect(globHandlerOutput).to.eventually.be.an('array');
    });

    // Ensure `getConcatenationItems()` promise resolves to an array with correct length.
    it('resolves with 3 items', function() {
      return expect(globHandlerOutput).to.eventually.have.lengthOf(3);
    });

    // Ensure `getConcatenationItems()` promise resolves to an array with correct contents.
    it('resolves with expected items', function() {
      const expectedArray = [
        new ConcatenationItem('Hello, world A!\n', './test/unit/test-files/a.txt'),
        new ConcatenationItem('Hello, world B!\n', './test/unit/test-files/b.txt'),
        new ConcatenationItem('Hello, world C!\n', './test/unit/test-files/c.txt'),
      ];

      return expect(globHandlerOutput).to.eventually.eql(expectedArray);
    });
  });
});
