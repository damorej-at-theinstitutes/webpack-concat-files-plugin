const ConcatenationHandler = require('../../src/concatenation-handler.js');
const ConcatenationItem = require('../../src/concatenation-item.js');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

/*
 * Tests describing ConcatenationHandler class.
 */
describe('ConcatenationHandler', function() {

  /*
   * Tests for ConcatenationHandler::constructor().
   */
  describe('#constructor()', function() {
    const transforms = {
      before: (content, filepath) => {
        return `-- FROM ${filepath} --\n${content}`;
      },
      after: (content) => {
        return `== THIS CONTENT IS CONCATENATED ==\n${content}`;
      }
    };

    let concatenationHandlerA;
    let concatenationHandlerB;

    // Create ConcatenationHandler instances for testing.
    before(function() {
      concatenationHandlerA = new ConcatenationHandler('\n\n');
      concatenationHandlerB = new ConcatenationHandler('\n', transforms);
    });

    // Ensure that `separator` property is set correctly.
    it('sets the `separator` property', function() {
      expect(concatenationHandlerA.separator).to.equal('\n\n');
      expect(concatenationHandlerB.separator).to.equal('\n');
    });

    // Ensure that `transforms` property is set correctly.
    it('sets the `transforms` property', function() {
      expect(concatenationHandlerA.transforms).to.be.undefined;
      expect(concatenationHandlerB.transforms).to.equal(transforms);
    });
  });

  /*
   * Tests for ConcatenationHandler::concatenate().
   */
  describe('#concatenate()', function() {
    const transforms = {
      before: (content, filepath) => {
        return `- ${content}`;
      },
      after: (content) => {
        return `== THIS CONTENT IS CONCATENATED ==\n${content}`;
      }
    };

    let concatenationHandler;
    let concatenatedOutput;

    // Perform concatenation with transforms so result can be tested.
    before(function() {
      concatenationHandler = new ConcatenationHandler('\n', transforms);
      const itemA = new ConcatenationItem('Hello, world! A', './test-files/a.txt');
      const itemB = new ConcatenationItem('Hello, world! B', './test-files/b.txt');
      const itemC = new ConcatenationItem('Hello, world! C', './test-files/c.txt');
      concatenatedOutput = concatenationHandler.concatenate([itemA, itemB, itemC]);
    });

    // Ensure that output is a `Promise` instance.
    it('returns a `Promise` instance', function() {
      expect(concatenatedOutput).to.be.a('promise');
    });

    // Ensure that promise resolves to a string with correct concatenated value.
    it('resolves to a string with expected value', function() {
      const expectedString = '== THIS CONTENT IS CONCATENATED ==\n- Hello, world! A\n- Hello, world! B\n- Hello, world! C';
      return expect(concatenatedOutput).to.eventually.equal(expectedString);
    });
  });
});
