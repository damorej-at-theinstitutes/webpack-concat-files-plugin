const globby = require('globby');
const path = require('path');
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
   * Resolves to an array of paths to files included by this glob.
   *
   * @returns {string[]} Array of paths to files included in this glob.
   */
  async getPaths() {
    return await globby(this.globs);
  }

  /**
   * Resolves to an array of file and directory paths included by this glob.
   *
   * @returns {string[]} Array of file and directory paths.
   */
  async getPathsWithDirectories() {
    const filePaths = await this.getPaths();
    const dirPaths = filePaths
      .map((filePath) => {
        return path.dirname(filePath)
      })
      .reduce((acc, cur) => {
        if (!acc.includes(cur)) {
          acc.push(cur);
        }
        return acc;
      }, [])

    return [
      ...dirPaths,
      ...filePaths,
    ];
  }

  /**
   * Resolves to an array of ConcatenationItems.
   *
   * Each ConcatenationItem instance corresponds to a file included in this
   * glob.
   *
   * @param {string} encoding - Encoding to use for file loading.
   *
   * @returns {Promise} Promise resolving to array of ConcatenationItems.
   */
  async getConcatenationItems(encoding) {
    const filepaths = await this.getPaths();
    const loadPromises = filepaths.map((filepath) => {
      return ConcatenationItem.loadFromFile(filepath, encoding);
    });
    return Promise.all(loadPromises);
  }
}

module.exports = GlobHandler;
