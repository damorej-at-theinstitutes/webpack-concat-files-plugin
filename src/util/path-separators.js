const path = require('path');

/**
 * Replaces OS path separators with a given string.
 *
 * @param {string} filepath - Filepath with separators to replace.
 * @param {string} newSeparator - New filepath separator.
 *
 * @returns {string} Filepath with new path separators.
 */
replacePathSeparator = (filepath, newSeparator) => {
  return filepath.split(path.sep).join(newSeparator);
}

/**
 * Restores OS path separators to a given filepath.
 *
 * @param {string} filepath - Filepath with separators to restore.
 * @param {string} separator - Custom separator to be replaced by OS separator.
 *
 * @returns {string} Filepath with OS path separators.
 */
restorePathSeparator = (filepath, separator) => {
  return filepath.split(separator).join(path.sep);
}

module.exports = {
  replacePathSeparator,
  restorePathSeparator,
};
