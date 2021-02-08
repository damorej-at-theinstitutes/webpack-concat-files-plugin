const ConcatenationHandler = require('./concatenation-handler.js');
const FileTracker = require('./file-tracker.js');
const FileTrackerInterfaceWebpack4 = require('./file-tracker-interface-webpack4.js');
const FileTrackerInterfaceWebpack5 = require('./file-tracker-interface-webpack5.js');
const GlobHandler = require('./glob-handler.js');
const GlobTracker = require('./glob-tracker.js');
const optionsSchema = require('./options-schema.js');
const path = require('path');
const { RawSource } = require('webpack-sources');
const { validate } = require('schema-utils');
const { replacePathSeparator } = require('./util/path-separators.js');

// Plugin name.
const PLUGIN_NAME = 'WebpackConcatenateFilesPlugin';

/**
 * Concatenates specified files during Webpack compilation.
 */
class WebpackConcatenateFilesPlugin {

  /**
   * Constructor.
   *
   * Validates and applies plugin options.
   *
   * @param {Object} options - Webpack plugin options.
   */
  constructor(options = {}) {
    validate(optionsSchema, options, PLUGIN_NAME);
    this.options = options;
  }

  /**
   * Applies the plugin for Webpack compilation.
   *
   * This is called once per Webpack execution, and allows the plugin to tap
   * into necessary event hooks.
   *
   * @param {Object} compiler - Webpack compiler instance.
   */
  apply(compiler) {
    const {
      bundles,
      separator = '\n',
      allowWatch = true,
      allowOptimization = false,
    } = this.options;
    const self = this;
    const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
    const globTracker = new GlobTracker();

    let fileTracker;
    let prevAssets = [];

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation, compilationParams) => {

      /**
       * Determines whether Webpack 4 or 5 is being used.
       *
       * This is probably a naive way to determine Webpack version; update this
       * if a better solution becomes apparent.
       *
       * @returns {number} Major Webpack version being used.
       */
      const WEBPACK_VERSION = (() => {
        if (compilation.fileTimestamps) {
          return 4;
        }
        return 5;
      })();

      /**
       * Determines which compilation hook to use.
       *
       * Webpack 4 should use `additionalAssets` whereas Webpack 5 should use
       * `processAssets`.
       *
       * @returns {Object} Webpack compilation hook.
       */
      const ASSET_HOOK = (() => {
        if (WEBPACK_VERSION > 4) {
          return compilation.hooks.processAssets;
        }
        return compilation.hooks.additionalAssets;
      })();

      /**
       * Determines the first parameter value for the compilation hook.
       *
       * @returns {Object|string} Compilation hook parameter value.
       */
      const ASSET_HOOK_PARAM = (() => {
        if (WEBPACK_VERSION > 4) {
          return {
            name: PLUGIN_NAME,
            stage: compilation.PROCESS_ASSETS_STAGE_PRE_PROCESS,
          };
        }
        return PLUGIN_NAME;
      })();

      /**
       * Creates or gets a file tracker instance to use throughout compilation.
       *
       * If a FileTracker instance was already created during a previous run,
       * it continues to be used.
       *
       * Depending on which version of Webpack is running, a different
       * interface is assigned to handle version-specific file tracking
       * operations.
       *
       * @returns {Object} FileTracker instance.
       */
      fileTracker = (() => {
        if (fileTracker) {
          return fileTracker;
        }
        const fileTrackerInterface = (WEBPACK_VERSION > 4) ? FileTrackerInterfaceWebpack5 : FileTrackerInterfaceWebpack4;
        return new FileTracker(compiler, new fileTrackerInterface());
      })();

      ASSET_HOOK.tapAsync(ASSET_HOOK_PARAM, async (p1, p2) => {
        /*
         * This function's signature differs depending on which hook is used.
         * Assign the parameters to constants with sensible names depending on
         * availability.
         */
        const callback = (p2 ? p2 : p1);
        const assets = (p2 ? p1 : compilation.assets);

        await fileTracker.run(compilation);

        const promises = bundles.map(async (bundle) => {
          const { transforms, encoding = 'utf8' } = bundle;
          // TODO Remove conditional and warning when `source` and 'destination' options are removed.
          if ((bundle.source || bundle.destination) && fileTracker.isFirstRun()) {
            logger.warn(`The 'bundle.source' and 'bundle.destination' options have been deprecated and will be removed. Use 'bundle.src' and 'bundle.dest' instead.`);
          }

          const src = (() => {
            // TODO Remove conditional assignment once `source` and `destination` options are removed.
            const srcOption = bundle.src || bundle.source;

            if (Array.isArray(srcOption)) {
              return srcOption.map((srcString) => {
                return replacePathSeparator(srcString, '/');
              });
            }
            return replacePathSeparator(srcOption, '/');
          })();

          const dest = bundle.dest || bundle.destination;

          const globHandler = new GlobHandler(src);
          const concatHandler = new ConcatenationHandler(separator, transforms);
          const concatPaths = await globHandler.getPathsWithDirectories();
          globTracker.set(dest, concatPaths);

          if (allowWatch) {
            fileTracker.createWatchers(concatPaths, compilation);
          }

          const changedBundleFiles = concatPaths.filter((filepath) => {
            return fileTracker.getChangedFiles().includes(filepath);
          });

          const concatKey = replacePathSeparator(path.relative(compiler.options.output.path, dest), '/');

          // No files within this bundle have changed; short-circuit.
          if (!globTracker.hasChanged(dest) && !changedBundleFiles.length && !fileTracker.isFirstRun()) {
            compilation.assets[concatKey] = prevAssets[concatKey];
            return;
          }

          const concatItems = await globHandler.getConcatenationItems(encoding);
          const concatAsset = await concatHandler.concatenate(concatItems);

          /*
           * If `allowOptimization` is false, set the asset info's `minimized`
           * property to `true` to prevent further minification/optimization.
           */
          compilation.emitAsset(concatKey, new RawSource(concatAsset), {
            minimized: !allowOptimization,
          });
        });

        await Promise.all(promises);
        prevAssets = compilation.assets;
        globTracker.reset();
        fileTracker.reset(compilation);
        callback();
      });
    });
  }
}

module.exports = WebpackConcatenateFilesPlugin;
