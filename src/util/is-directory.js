const promisify = require('util').promisify;

/**
 * Determines if the given filepath is a directory.
 *
 * Relies on `fs.lstat`. The supplied FS module must implement this function.
 *
 * @param {string} filepath - Path to file or directory.
 * @param {Object} fsModule - Filesystem module to use for operation.
 *
 * @returns {Promise} Promise resolving to true if filepath is a directory.
 */
const isDirectory = async (filepath, fsModule) => {
  const lstat = promisify(fsModule.lstat);
  const stats = await lstat(filepath);
  return stats.isDirectory();
}

module.exports = isDirectory;
