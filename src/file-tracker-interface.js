const path = require('path');

/**
 * Abstract class for file tracker interface implementations.
 *
 * This should be extended to add support for multiple versions of Webpack
 * which may handle file tracking differently.
 */
class FileTrackerInterface {

  /**
   * Constructor.
   *
   * Optionally accepts a filesystem module to use in place of Node's default
   * `fs` module.
   *
   * @param {Object=} fs - Filesystem module for file tracking.
   */
  constructor(fs) {
    this.firstRun = true;
    this.startTime = Date.now();
    this.fsModule = (fs || require('fs'));
  }

  /**
   * Runs the file tracker.
   *
   * @param {Object} compiler - Webpack compiler instance.
   * @param {Object} compilation - Webpack compilation instance.
   */
  async run(compiler, compilation) {
    this._onRun(compiler, compilation);
  }

  /**
   * Resets the file tracker in preparation for the next run.
   *
   * @param {Object} compilation - Webpack compilation instance.
   */
  reset(compilation) {
    this.firstRun = false;
    this._onReset(compilation);
  }

  /**
   * Called when FileTracker runs.
   *
   * Responsible for determining which files have changed since last run.
   *
   * @param {Object} compiler - Webpack compiler instance.
   * @param {Object} compilation - Webpack compilation instance.
   */
  async _onRun(compiler, compilation) {
    throw new Error('`FileTrackerInterface._onRun()` has not been implemented.');
  }

  /**
   * Called when FileTracker resets.
   *
   * Responsible for preparing FileTracker for next run.
   *
   * @param {Object} compilation - Webpack compilation object.
   */
  _onReset(compilation) {
    throw new Error('`FileTrackerInterface._onReset()` has not been implemented.');
  }

  /**
   * Sets up Webpack file and directory dependencies for watch mode.
   *
   * @param {string[]} filepaths - Array of paths to files to watch.
   * @param {Object} compiler - Webpack compiler instance.
   * @param {Object} compilation - Webpack compilation instance.
   */
  createWatchers(filepaths, compiler, compilation) {
    const dirpaths = new Set();

    // Create watchers for files in `filepaths`.
    filepaths.forEach((filepath) => {
      const absolutePath = path.resolve(compiler.options.context, filepath);
      if (!compilation.fileDependencies.has(absolutePath)) {
        compilation.fileDependencies.add(absolutePath);
      }
      dirpaths.add(path.dirname(filepath));
    });

    // Create watchers for directories in `filepaths`.
    dirpaths.forEach((dirpath) => {
      const absolutePath = path.resolve(compiler.options.context, dirpath);
      if (!compilation.contextDependencies.has(absolutePath)) {
        compilation.contextDependencies.add(absolutePath);
      }
    });
  }

  /**
   * Returns an array of paths to files which have changed since last run.
   *
   * @returns {string[]} Array of paths to files which have changed.
   */
  getChangedFiles() {
    throw new Error('`FileTrackerInterface.getChangedFiles()` has not been implemented.');
  }
}

module.exports = FileTrackerInterface;
