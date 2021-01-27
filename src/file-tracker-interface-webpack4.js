const FileTrackerInterface = require('./file-tracker-interface.js');
const path = require('path');
const promisify = require('util').promisify;
const fileExists = require('./util/file-exists.js');
const isDirectory = require('./util/is-directory.js');
const { replacePathSeparator } = require('./util/path-separators.js');

/**
 * FileTrackerInterface implementation for Webpack 4.
 */
class FileTrackerInterfaceWebpack4 extends FileTrackerInterface {

  /**
   * Constructor.
   *
   * Optionally accepts a filesystem module to use in place of Node's default
   * `fs` module.
   *
   * @param {Object=} fs - Filesystem module for file tracking.
   */
  constructor(fs) {
    super(fs);
    this.prevTimestamps = null;
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
    const self = this;
    const changedFilesPromises = Array.from(compilation.fileTimestamps.keys())
      /*
       * Filter out files which haven't changed since last run.
       * Accomplish this by comparing their timestamps against the previous run.
       */
      .filter((file) => {
        if (!self.prevTimestamps) {
          return true;
        }
        const absolutePath = path.resolve(compiler.options.context, file);
        const prevTimestamp = (self.prevTimestamps.get(absolutePath) || self.startTime);
        const newTimestamp = (compilation.fileTimestamps.get(absolutePath) || Infinity);

        return (prevTimestamp < newTimestamp);
      })
      /*
       * Map filepaths to an array of promises which resolves to undefined if
       * the filepath does not exist or if it exists but is a directory.
       */
      .map(async (file) => {
        const lstat = promisify(self.fsModule.lstat);
        //if (await fileExists(file, self.fsModule)) {
        if ((await fileExists(file, self.fsModule)) && !(await isDirectory(file, self.fsModule))) {
          return file;
        }
        return undefined;
      });

    // Resolve file check promises and remove any `undefined` values.
    this.changedFiles = (await Promise.all(changedFilesPromises))
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
   * @param {Object} compilation - Webpack compilation object.
   */
  _onReset(compilation) {
    // Consider copying instead of cloning.
    this.prevTimestamps = compilation.fileTimestamps;
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

module.exports = FileTrackerInterfaceWebpack4;
