const path = require('path');
const promisify = require('util').promisify;

/**
 * Contains content and metadata to be included in concatenation.
 */
class ConcatenationItem {

  /**
   * Constructor.
   *
   * @param {string} content - Content to be concatenated.
   * @param {string} filepath - Path to file which contains content.
   */
  constructor(content, filepath) {
    /// String containing content to be concatenated.
    this.content = content;

    /// String containing path to content being concatenated. Can be relative or absolute.
    this.filepath = filepath;
  }

  /**
   * Creates a ConcatenationItem from a file at the given path.
   *
   * No checking is performed to ensure that the given path is valid; if an
   * error occurs while reading the file, a corresponding exception is thrown.
   *
   * An optional filesystem module can be supplied if using MemFS or similar.
   * By default, Node's `fs` module is used.
   *
   * @param {string} filepath - Path to file from which to create ConcatenationItem.
   * @param {string} encoding - Encoding to use when reading file.
   * @param {Object=} fs - Filesystem module for reading file.
   *
   * @throws {Error} `fs.readFileSync` errors.
   *
   * @returns {Object} ConcatenationItem.
   */
  static loadFromFileSync(filepath, encoding, fs) {
    const fsModule = (fs || require('fs'));
    const content = fsModule.readFileSync(filepath, encoding);
    return new ConcatenationItem(content, filepath);
  }

  /**
   * Asynchronously creates a ConcatenationItem from a file at the given path.
   *
   * No checking is performed to ensure that the given path is valid; if an
   * error occurs while reading the file, the returned promise will be rejected.
   *
   * An optional filesystem module can be supplied if using MemFS or similar.
   * By default, Node's `fs` module is used.
   *
   * @param {string} filepath - Path to file from which to create ConcatenationItem.
   * @param {string} encoding - Encoding to use when reading file.
   * @param {Object=} fs - Filesystem module for reading file.
   *
   * @returns {Promise} Promise resolving to ConcatenationItem.
   */
  static async loadFromFile(filepath, encoding, fs) {
    const fsModule = (fs || require('fs'));
    const content = await promisify(fsModule.readFile)(filepath, encoding);
    return new ConcatenationItem(content, filepath);
  }
}

module.exports = ConcatenationItem;
