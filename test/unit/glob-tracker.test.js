const GlobTracker = require('../../src/glob-tracker.js');
const chai = require('chai');
const expect = chai.expect;

/*
 * Tests for GlobTracker class.
 */
describe('GlobTracker', function() {

  /*
   * Tests for GlobTracker::constructor().
   */
  describe('#constructor()', function() {

    // Ensure properties are set up correctly.
    it('sets the `prevGlobs` and `currentGlobs` properties correctly', function() {
      const globTracker = new GlobTracker();
      expect(globTracker.prevGlobs).to.eql({});
      expect(globTracker.currentGlobs).to.eql({});
    });

  });

  /*
   * Tests for GlobTracker::get().
   */
  describe('#get()', function() {
    let globTracker;

    // Create a new GlobTracker instance for each test.
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    // Ensure that an empty array is returned if no value is set.
    it('returns an empty array if no value is set for the given key', function() {
      expect(globTracker.get('keyA')).to.be.an('array');
      expect(globTracker.get('keyA')).to.be.empty;
    });

    // Ensure that the correct value is returned if a value is set.
    it('returns the correct value if a value is set for the given key', function() {
      globTracker.set('keyA', ['./file']);
      expect(globTracker.get('keyA')).to.eql(['./file']);
    });
  });

  /*
   * Tests for GlobTracker::getPrev().
   */
  describe('#getPrev()', function() {
    let globTracker;

    // Create a new GlobTracker instance for each test.
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    // Ensure that an empty array is returned if no value is set.
    it('returns an empty array if no previous value is set for the given key', function() {
      expect(globTracker.getPrev('keyA')).to.be.an('array');
      expect(globTracker.getPrev('keyA')).to.be.empty;
    });

    // Ensure that the correct value is returned if a value is set.
    it('returns the correct value if a previous value is set for the given key', function() {
      globTracker.set('keyA', ['./file']);
      globTracker.reset();
      expect(globTracker.getPrev('keyA')).to.eql(['./file']);
    });
  });

  /*
   * Tests for GlobTracker::set().
   */
  describe('#set()', function() {
    let globTracker;

    // Create a new GlobTracker instance for each test.
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    // Ensure that the correct value is set for the given key.
    it('sets the correct value for the given key', function() {
      expect(globTracker.currentGlobs['keyA']).to.be.undefined;
      globTracker.set('keyA', ['./file']);
      expect(globTracker.currentGlobs['keyA']).to.eql(['./file']);
    });
  });

  /*
   * Tests for GlobTracker::hasChanged().
   */
  describe('#hasChanged()', function() {
    let globTracker;

    // Create a new GlobTracker instance for each test.
    beforeEach(function() {
      globTracker = new GlobTracker();
    });

    // Ensure that `false` is returned if no values have been set.
    it('returns `false` when no values have been set', function() {
      expect(globTracker.hasChanged('keyA')).to.be.false;
    });

    // Ensure that `true` is returned when a value has changed.
    it('returns `true` when a new value has been set', function() {
      globTracker.set('keyA', ['./dir']);
      expect(globTracker.hasChanged('keyA')).to.be.true;
    });

    // Ensure that `false` is returned when called immediately after 'reset'.
    it('returns `false` after #reset()', function() {
      globTracker.set('keyA', ['./dir']);
      globTracker.reset();
      expect(globTracker.hasChanged('keyA')).to.be.false;
    });

    // Ensure that 'true' is returned when a value has changed after a reset.
    it('returns `true` after #reset() and #set()', function() {
      globTracker.set('keyA', ['./dir']);
      globTracker.reset();
      globTracker.set('keyA', ['./dir', './dir2']);
      expect(globTracker.hasChanged('keyA')).to.be.true;
    });
  });

  /*
   * Tests for GlobTracker::reset().
   */
  describe('#reset()', function() {
    const globTracker = new GlobTracker();

    // Set value for GlobTracker instance under key named 'keyA'.
    before(function() {
      globTracker.set('keyA', ['./file', './file/file.txt']);
    });

    // Confirm that previous glob values are preserved as expected.
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
