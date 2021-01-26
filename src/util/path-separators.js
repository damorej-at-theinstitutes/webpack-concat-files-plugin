const path = require('path');

replacePathSeparator = (filepath, newSeparator) => {
  return filepath.split(path.sep).join(newSeparator);
}

restorePathSeparator = (filepath, separator) => {
  return filepath.split(separator).join(path.sep);
}

module.exports = {
  replacePathSeparator,
  restorePathSeparator,
};
