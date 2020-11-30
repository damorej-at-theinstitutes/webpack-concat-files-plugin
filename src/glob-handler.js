const globby = require('globby');
const ConcatenationItem = require('./concatenation-item.js');

/**
 * Resolves globs into an array of ConcatenationItem instances.
 */
class GlobHandler {

  /**
   * Constructor.
   *
   * @param {string|array} globs - A glob string, or an array of glob strings.
   */
  constructor(globs) {
    /// Array of glob strings.
    this.globs = (() => {
      if (!globs) {
        return [];
      }
      if (Array.isArray(globs)) {
        return globs;
      }
      return [globs];
    })();
  }

  /**
   * Resolves to an array of ConcatenationItems.
   *
   * Each ConcatenationItem instance corresponds to a file included in this
   * `globs`.
   *
   * @returns {Promise} Promise resolving to array of ConcatenationItems.
   */
  async getConcatenationItems() {
    const filepaths = await globby(this.globs);
    const loadPromises = filepaths.map((filepath) => {
      return ConcatenationItem.loadFromFile(filepath, 'utf8');
    });
    return Promise.all(loadPromises);
  }
}

module.exports = GlobHandler;
