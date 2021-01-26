const arraysEqual = require('./util/arrays-equal.js');
const { replacePathSeparator, restorePathSeparator } = require('./util/path-separators.js');

/**
 * Tracks changes in glob results over a period of time.
 */
class GlobTracker {

  /**
   * Constructor.
   */
  constructor() {
    /// Map of keys and associated glob values for previous interval.
    this.prevGlobs = {};

    /// Map of keys and associated glob values for current interval.
    this.currentGlobs = {};
  }

  /**
   * Returns the current value for the glob stored with the given key.
   *
   * If no data is stored for the given key, an empty array is returned.
   *
   * @param {string} key - Key with which to search for glob value.
   *
   * @returns {Array} Array containing glob value, or an empty array.
   */
  get(key) {
    const transformedKey = replacePathSeparator(key, '/');
    if (this.currentGlobs[transformedKey]) {
      return this.currentGlobs[transformedKey];
    }
    return [];
  }

  /**
   * Returns the previous value for the glob stored with the given key.
   *
   * If no data is stored for the given key, an empty array is returned.
   *
   * @param {string} key - Key with which to search for previous glob value.
   *
   * @returns {Array} Array containing previous glob value, or an empty array.
   */
  getPrev(key) {
    const transformedKey = replacePathSeparator(key, '/');
    if (this.prevGlobs[transformedKey]) {
      return this.prevGlobs[transformedKey];
    }
    return [];
  }

  /**
   * Sets the value for the glob with the given key.
   *
   * @params {string} key - Key for glob value being set.
   * @params {Array} globValue - Glob value to set for key.
   */
  set(key, globValue) {
    const transformedKey = replacePathSeparator(key, '/');
    this.currentGlobs[transformedKey] = globValue;
  }

  /**
   * Determines if a glob value has changed in the current interval.
   *
   * @param {string} key - Key with which to compare glob value.
   *
   * @returns {boolean} True if value has changed, false otherwise.
   */
  hasChanged(key) {
    const transformedKey = replacePathSeparator(key, '/');
    return !(arraysEqual(this.get(transformedKey), this.getPrev(transformedKey)));
  }

  /**
   * Resets the tracker in order to compare values during a new interval.
   */
  reset() {
    this.prevGlobs = {...this.currentGlobs};
  }
}

module.exports = GlobTracker;
