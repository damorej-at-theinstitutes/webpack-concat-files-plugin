const promisify = require('util').promisify;

/**
 * Determine if a file is accessible asynchronously.
 *
 * Relies on `fs.access`. The supplied FS module must implement this function.
 *
 * @param {string} filepath - Path to file for which to check existence.
 * @param {Object} fsModule - Filesystem module to use for operation.
 *
 * @returns {Promise} Promise resolving to true if file at filepath exists.
 */
const fileExists = async (filepath, fsModule) => {
  const access = promisify(fsModule.access);
  let exists = true;
  try {
    await access(filepath, fsModule.constants.F_OK);
  }
  catch (e) {
    exists = false;
  }
  return exists;
}

module.exports = fileExists;
