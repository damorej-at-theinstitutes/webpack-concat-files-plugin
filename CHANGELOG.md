# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] - 2020-10-20
### Fixed
- Issue causing `ENOENT` errors when watched files get deleted

### Added
- *Contributors* section to `README.md`

## [0.4.0] - 2020-07-10
### Changed
- Output files using Webpack compilation `assets` object
- Use Webpack `fileDependencies` and `contextDependencies` objects for file and directory watching, respectively
- Improve `README.md` options documentation

### Removed
- Custom log output using `webpack-log` package
- `chokidar` and `webpack-log` dependencies

## [0.3.1] - 2020-01-28
### Fixed
- Issue in `prepareBundleDestination` causing `ENOENT` errors

## [0.3.0] - 2020-01-02
### Added
- Second parameter to `before` transformation callback which contains the path to the source file.

## [0.2.0] - 2019-12-20
### Added
- Support for automatic bundle concatenation when Webpack is in watch mode
- `allowWatch` option to enable/disable automatic bundle concatenation when Webpack is in watch mode
- Log message upon successful bundle concatenation

## [0.1.1] - 2019-12-19
Initial release
