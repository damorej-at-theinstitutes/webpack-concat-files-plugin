const FileTrackerInterface = require('./file-tracker-interface.js');
const promisify = require('util').promisify;

// TODO Refactor `fileExists` and `isDirectory` into separate module and add unit tests.
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

/*
 * TODO Investigate whether `FileTrackerInterfaceWebpack5` can be simplified
 * using Webpack `fileSystemInfo.createSnapshot()` and related APIs.
 */
/**
 * FileTrackerInterface implementation for Webpack 5.
 */
class FileTrackerInterfaceWebpack5 extends FileTrackerInterface {

  /**
   * Constructor.
   *
   * Optionally accepts a filesystem module to use in place of Node's default
   * `fs` module.
   *
   * @param {Object} fs - Filesystem module for file tracking.
   */
  constructor(fs) {
    super(fs);
    this.changedFiles = [];
  }

  /**
   * Called when concatenation occurs.
   *
   * When Webpack is not in watch mode, this will only occur once. Otherwise
   * it can occur any number of times.
   *
   * Determines which files have changed since last run.
   *
   * @param {Object} compiler - Webpack compiler instance.
   * @param {Object} compilation - Webpack compilation instance.
   */
  async _onRun(compiler, compilation) {
    const fs = this.fsModule;
    const changedFilePaths = [
      ...(!!compiler.modifiedFiles ? Array.from(compiler.modifiedFiles.keys()) : []),
      ...(!!compiler.removedFiles ? Array.from(compiler.removedFiles.keys()) : []),
    ];

    const changedFilePromises = changedFilePaths
      .map(async (changedFile) => {
        if (!(await fileExists(changedFile, fs)) || await isDirectory(changedFile, fs)) {
          return undefined;
        }
        return changedFile;
      });

    this.changedFiles = (await Promise.all(changedFilePromises))
      .filter((changedFile) => {
        return (!!changedFile);
      });
  }

  /**
   * Called after concatenation occurs to prepare for next run.
   *
   * When Webpack is not in watch mode, this will only occur once. Otherwise
   * it can occur any number of times.
   *
   * This method is left empty for `FileTrackerInterfaceWebpack5` because it
   * is not needed.
   *
   * @param {Object} compilation - Webpack compilation object.
   */
  async _onReset(compilation) {
    // No reset action required.
  }

  /**
   * Returns an array of file paths for files which have changed since last run.
   *
   * @returns {string[]} Array of file paths that have chaned since last run.
   */
  getChangedFiles() {
    return this.changedFiles;
  }
}

module.exports = FileTrackerInterfaceWebpack5;
