/**
 * Provides a common interface for tracking watched files for Webpack 4 and 5.
 */
class FileTracker {

  /**
   * Constructor.
   *
   * @param {Object} compiler - Webpack compiler object.
   * @param {Object} fileTrackerInterface - Instance of FileTrackerInterface or subclass.
   */
  constructor(compiler, fileTrackerInterface) {
    this.compiler = compiler;
    this.fileTrackerInterface = fileTrackerInterface;
  }

  /**
   * Runs the file tracker. Should only run once per compilation.
   *
   * @param {Object} compilation - Webpack compilation object.
   */
  async run(compilation) {
    this.fileTrackerInterface.run(this.compiler, compilation);
  }

  /**
   * Resets the file tracker in preparation for next compilation.
   *
   * @param {Object} compilation - Webpack compilation object.
   */
  reset(compilation) {
    this.fileTrackerInterface.reset(compilation);
  }

  /**
   * Creates Webpack watchers for the given filepaths.
   *
   * @param {string} filepaths - Array of paths to files to watch.
   * @param {Object} compilation - Webpack compilation object.
   */
  createWatchers(filepaths, compilation) {
    this.fileTrackerInterface.createWatchers(filepaths, this.compiler, compilation);
  }

  /**
   * Returns an array of filepaths for files which have changed since last run.
   *
   * This should be called between executing `run()` but before executing
   * `reset()`.
   *
   * @returns {string[]} Array of paths to changed files.
   */
  getChangedFiles() {
    return this.fileTrackerInterface.getChangedFiles();
  }

  /**
   * Determines if the file tracker has run before.
   *
   * @returns {bool} True if file tracker has run, false otherwise.
   */
  isFirstRun() {
    return this.fileTrackerInterface.firstRun;
  }
}

module.exports = FileTracker;
