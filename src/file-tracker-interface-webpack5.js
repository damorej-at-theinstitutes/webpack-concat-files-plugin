const FileTrackerInterface = require('./file-tracker-interface.js');
const promisify = require('util').promisify;
const fileExists = require('./util/file-exists.js');
const isDirectory = require('./util/is-directory.js');
const { replacePathSeparator } = require('./util/path-separators.js');

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
    return this.changedFiles.map((changedFile) => {
      return replacePathSeparator(changedFile, '/');
    });
  }
}

module.exports = FileTrackerInterfaceWebpack5;
