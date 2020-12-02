const GlobTracker = require('../../src/glob-tracker.js');
const chai = require('chai');
const expect = chai.expect;

describe('GlobTracker', function() {
  describe('#constructor()', function() {

    it('sets the `prevGlobs` and `currentGlobs` properties correctly', function() {
      const globTracker = new GlobTracker();
      expect(globTracker.prevGlobs).to.eql({});
      expect(globTracker.currentGlobs).to.eql({});
    });

  });

  describe('#get()', function() {
    let globTracker;
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    it('returns an empty array if no value is set for the given key', function() {
      expect(globTracker.get('keyA')).to.be.an('array');
      expect(globTracker.get('keyA')).to.be.empty;
    });

    it('returns the correct value if a value is set for the given key', function() {
      globTracker.set('keyA', ['./file']);
      expect(globTracker.get('keyA')).to.eql(['./file']);
    });
  });

  describe('#getPrev()', function() {
    let globTracker;
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    it('returns an empty array if no previous value is set for the given key', function() {
      expect(globTracker.getPrev('keyA')).to.be.an('array');
      expect(globTracker.getPrev('keyA')).to.be.empty;
    });

    it('returns the correct value if a previous value is set for the given key', function() {
      globTracker.set('keyA', ['./file']);
      globTracker.reset();
      expect(globTracker.getPrev('keyA')).to.eql(['./file']);
    });
  });

  describe('#set()', function() {
    let globTracker;
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    it('sets the correct value for the given key', function() {
      expect(globTracker.currentGlobs['keyA']).to.be.undefined;
      globTracker.set('keyA', ['./file']);
      expect(globTracker.currentGlobs['keyA']).to.eql(['./file']);
    });
  });

  describe('#hasChanged()', function() {
    let globTracker;
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    it('returns `false` when no values have been set', function() {
      expect(globTracker.hasChanged('keyA')).to.be.false;
    });

    it('returns `true` when a new value has been set', function() {
      globTracker.set('keyA', ['./dir']);
      expect(globTracker.hasChanged('keyA')).to.be.true;
    });

    it('returns `false` after #reset()', function() {
      globTracker.set('keyA', ['./dir']);
      globTracker.reset();
      expect(globTracker.hasChanged('keyA')).to.be.false;
    });

    it('returns `true` after #reset() and #set()', function() {
      globTracker.set('keyA', ['./dir']);
      globTracker.reset();
      globTracker.set('keyA', ['./dir', './dir2']);
      expect(globTracker.hasChanged('keyA')).to.be.true;
    });
  });

  describe('#reset()', function() {
    const globTracker = new GlobTracker();
    before(function() {
      globTracker.set('keyA', ['./file', './file/file.txt']);
    });

    it('sets the `prevGlobs` property to the value stored by `currentGlobs`', function() {
      globTracker.reset();
      expect(globTracker.prevGlobs['keyA']).to.eql(['./file', './file/file.txt']);
      globTracker.reset();
      expect(globTracker.prevGlobs['keyA']).to.eql(['./file', './file/file.txt']);
      globTracker.set('keyA', ['./file', './file/file2.txt']);
      globTracker.reset();
      expect(globTracker.prevGlobs['keyA']).to.eql(['./file', './file/file2.txt']);
    });
  });
});
