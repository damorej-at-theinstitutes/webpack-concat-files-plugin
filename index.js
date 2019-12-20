const chokidar = require('chokidar');
const fs = require('fs');
const globby = require('globby');
const promisify = require('util').promisify;

// Promisified fs functions.
const readFilePromise = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);
const openPromise = promisify(fs.open);

const log = require('webpack-log')({ name: 'WebpackConcatenateFilesPlugin' });

class WebpackConcatenateFilesPlugin {

  /**
   * Constructor.
   *
   * Retrieves options and binds apply method.
   *
   * @param {Object} options - Plugin options.
   */
  constructor(options) {
    this.options = options;
    this.watchers = null;

    // Bind apply function.
    this.apply = this.apply.bind(this);
  }

  /**
   * Applies concatenation for specified bundles.
   *
   * @param {Object} compiler - Webpack compiler object.
   */
  async apply(compiler) {
    const { bundles, separator = '\n', allowWatch = true } = this.options;

    /*
     * Webpack "run" hook.
     *
     * Called when Webpack is ran without watch mode.
     */
    compiler.hooks.run.tapAsync(
      'WebpackConcatenateFilesPlugin',
      async (compiler, callback) => {
        await this.concatenateAllBundles(bundles, separator);
        callback();
      }
    );

    /*
     * Webpack "watchRun" hook.
     *
     * Called when Webpack is ran with watch mode. If allowWatch is true, this
     * hook sets up file watchers for each bundle source to allow bundles to
     * be automatically concatenated.
     */
    compiler.hooks.watchRun.tapAsync(
      'WebpackConcatenateFilesPlugin',
      async (compiler, callback) => {
        if (this.watchers === null) {
          if (allowWatch) {
            // Set up watchers.
            this.watchers = [];

            const watcherOptions = {
              ignoreInitial: true,
            }

            bundles.forEach((bundle) => {
              const watcher = chokidar.watch(bundle.source, watcherOptions);
              watcher
                .on('add', file => this.concatenateBundle(bundle))
                .on('change', file => this.concatenateBundle(bundle))
                .on('unlink', file => this.concatenateBundle(bundle));

              this.watchers.push(watcher);
            });
          }

          // Perform initial concatenation.
          await this.concatenateAllBundles(bundles, separator);
        }

        callback();
      }
    );

    /*
     * Webpack "watchClose" hook.
     *
     * Called when Webpack stops watching. Closes any file watchers that were
     * set up in the "watchRun" hook.
     */
    compiler.hooks.watchClose.tap(
      'WebpackConcatenateFilesPlugin',
      () => {
        if (this.watchers) {
          this.watchers.forEach((watcher) => {
            watcher.close();
          });
        }
      }
    );
  }

  /**
   * Performs concatenation on all of the given bundles.
   *
   * @param {Object[]} bundles - Array of bundle objects to concatenate.
   * @param {string} separator - String to use to separate concatenated content.
   */
  async concatenateAllBundles(bundles, separator = '\n') {
    await Promise.all(bundles.map(async (bundle) => {
      return await this.concatenateBundle(bundle, separator);
    }));
  }

  /**
   * Performs concatenation for the given bundle.
   *
   * @param {Object} bundle - Object representing bundle to concatenate.
   * @param {string} separator - String to use to separate concatenated content.
   */
  async concatenateBundle(bundle, separator = '\n') {
    const { destination, source, transforms, encoding = 'utf8' } = bundle;
    const paths = await this.getPathsForSource(source);

    /*
     * Retrieve an array of objects describing the path and contents of
     * each file in paths.
     */
    const contentObjects = await Promise.all(
      // Transform paths into objects containing path and file read promise.
      paths.map((path) => {
        return this.getContentObjectForPath(path, encoding);
      })
      // Perform "before" transformations, if specified.
      .map((contentObject) => {
        return this.getTransformedContentObject(contentObject, transforms);
      })
      // Resolve content promises.
      .map(async (contentObject) => {
        return {
          ...contentObject,
          content: await contentObject.content,
        };
      })
    );

    let output = contentObjects.reduce((acc, cur) => {
      return this.joinContent(acc, cur.content, separator);
    }, '');

    if (transforms && transforms.after) {
      output = await this.applyAfterTransform(output, transforms.after);
    }

    await this.prepareBundleDestination(destination);
    await writeFilePromise(destination, output, encoding);
  }

  /**
   * Appends the given content to the given accumulated value.
   *
   * @param {*} acc - Accumulator.
   * @param {string} cur - Current string.
   *
   * @returns {string} Joined string.
   */
  joinContent(acc, cur, separator = '\n') {
    if (acc.length) {
      return `${acc}${separator}${cur}`;
    }
    return cur;
  }

  /**
   * Prepares bundle destination by creating an empty file.
   *
   * If the destination file already exists, the existing file is truncated
   * used instead.
   *
   * @param {string} destination - Bundle output destination.
   */
  async prepareBundleDestination(destination) {
    await openPromise(destination, 'w');
  }

  /**
   * Returns an array of paths found using the given glob string(s).
   *
   * @param {string|array} source - Input path glob, or array of input globs.
   *
   * @return {array} Array of paths found using input glob.
   */
  async getPathsForSource(source) {
    let fileSource = source;
    if (!Array.isArray(source)) {
      fileSource = [fileSource];
    }

    return await globby(fileSource);
  }

  /**
   * Gets an object containing the path and content promise for the given path.
   *
   * @param {string} path - Path to file.
   * @param {string} encoding - File encoding.
   *
   * @return {Object} Object containing path and content promise.
   */
  getContentObjectForPath(path, encoding = 'utf8') {
    return {
      path,
      content: readFilePromise(path, encoding),
    };
  }

  /**
   * Transforms the given contentObject's content using the given transform.
   *
   * @param {Object} contentObject - Content object to apply transformation.
   * @param {Object} transforms - Object containing content transformations.
   *
   * @return {Object} Content object with transformed content.
   */
  getTransformedContentObject(contentObject, transforms) {
    if (transforms && transforms.before) {
      const transformedContent = this.applyBeforeTransform(
        contentObject,
        transforms.before);

      return {
        ...contentObject,
        content: transformedContent,
      };
    }
    return contentObject;
  }

  /**
   * Applies the "Before" transformation to the given content object.
   *
   * @param {Object} contentObject - Content object to apply transformation.
   * @param {Object} transformation - Transformation callback.
   *
   * @return {Object} Content object with transformed content.
   */
  async applyBeforeTransform(contentObject, transformation) {
    const loadedContent = await contentObject.content;

    return await transformation(loadedContent);
  }

  /**
   * Applies the "After" transformation to the given content.
   *
   * @param {string} content - Content to apply transformation.
   * @param {Object} transformation - Transformation callback.
   *
   * @return {string} Transformed content.
   */
  async applyAfterTransform(content, transformation) {
    return await transformation(content);
  }
}

module.exports = WebpackConcatenateFilesPlugin;
