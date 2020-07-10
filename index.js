const fs = require('fs');
const globby = require('globby');
const path = require('path');
const promisify = require('util').promisify;
const { RawSource } = require('webpack-sources');

// Promisified fs functions.
const readFilePromise = promisify(fs.readFile);

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

    // Timestamp tracking.
    this.firstRun = true;
    this.startTime = Date.now();
    this.prevTimestamps = null;
    this.prevAssets = null;

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
    const plugin = this;

    compiler.hooks.emit.tapAsync(
      'WebpackConcatenateFilesPlugin',
      async (compilation, callback) => {
        /*
         * Determine which files have changed since the last run.
         * Only applicable when Webpack is in watch mode.
         */
        const changedFiles = Array
          .from(compilation.fileTimestamps.keys())
          .filter((watchFile) => {
            if (!plugin.prevTimestamps) {
              return true;
            }
            const absoluteWatchFile = path.resolve(compiler.options.context, watchFile);

            const lastTimestamp = plugin.prevTimestamps.get(absoluteWatchFile);
            const newTimestamp = compilation.fileTimestamps.get(absoluteWatchFile);

            return (
              (lastTimestamp || this.startTime) <
              (newTimestamp || Infinity)
            );
          })
          .filter((watchFile) => {
            return !(fs.lstatSync(watchFile).isDirectory());
          });

        await Promise.all(
          bundles
            .map(async bundle => {
              const filepaths = await this.getPathsForSource(bundle.source);

              /*
               * Determine if any of the source files for this bundle
               * have changed.
               */
              const bundleFilesAbsolute = filepaths.map((bundleFile) => {
                if (!path.isAbsolute(bundleFile)) {
                  return path.resolve(compiler.options.context, bundleFile);
                }
                return bundleFile;
              });

              const bundleHasChange = changedFiles.some((changedFile) => {
                const changedFileAbsolute = path.resolve(compiler.options.context, changedFile);
                return bundleFilesAbsolute.includes(changedFileAbsolute);
              });

              if (allowWatch) {
                this.createWatchers(filepaths, compiler, compilation);
              }

              /*
               * Short-circuit if bundle does not have any files that have
               * changed, emitting the existing asset from the previous run.
               */
              if (!bundleHasChange && !plugin.firstRun) {
                const outputKey = path.relative(compiler.options.output.path, bundle.destination);
                compilation.assets[outputKey] = this.prevAssets[outputKey];
                return;
              }

              const outputKey = path.relative(compiler.options.output.path, bundle.destination);
              const concatenatedBundle = await this.concatenateBundle(bundle, separator);

              compilation.assets[outputKey] = new RawSource(concatenatedBundle);

              // Log output message if in watch mode and not on first run.
              const logger = (() => {
                if (!compiler.watchMode || plugin.firstRun) {
                  return null;
                }
                if (!compiler.getInfrastructureLogger) {
                  return console;
                }
                return compiler.getInfrastructureLogger("webpack-concat-files-plugin");
              })();

              if (logger) {
                logger.info(`Concatenated '${outputKey}'`);
              }
            })
        );

        plugin.prevAssets = compilation.assets;
        plugin.prevTimestamps = compilation.fileTimestamps;
        plugin.firstRun = false;
        callback();
      }
    );
  }

  /**
   * Add source file directories and inidividual files to dependencies list.
   * Triggers Webpack to recompile when updates occur.
   *
   * @param {String[]} filepaths - Relative filepaths for source files.
   * @param {Object} compiler - Webpack compiler object.
   * @param {Object} compilation - Webpack compilation object.
   */
  createWatchers(filepaths, compiler, compilation) {
    let dirnames = new Set();
    filepaths.forEach(filepath => {
      const absolutePath = path.resolve(compiler.options.context, filepath);
      if (!compilation.fileDependencies.has(absolutePath)) {
        compilation.fileDependencies.add(absolutePath);
      }

      dirnames.add(path.dirname(filepath));
    });

    dirnames.forEach(dirname => {
      if (!compilation.contextDependencies.has(dirname)) {
        compilation.contextDependencies.add(path.resolve(compiler.options.context, dirname));
      }
    });
  }

  /**
   * Performs concatenation for the given bundle.
   *
   * @param {Object} bundle - Object representing bundle to concatenate.
   * @param {string} separator - String to use to separate concatenated content.
   */
  async concatenateBundle(bundle, separator = '\n') {
    const { source, transforms, encoding = 'utf8' } = bundle;
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

    return output;
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

    return await transformation(loadedContent, contentObject.path);
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
