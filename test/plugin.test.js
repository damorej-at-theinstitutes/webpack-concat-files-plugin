//const { createFsFromVolume, Volume } = require('memfs');
//const fs = createFsFromVolume(new Volume());
const expect = require('chai').expect;
const plugin = require('../src/index.js');
const webpack = require('webpack');
const config = require('./test-project/webpack.config.js');
const promisify = require('util').promisify;
const fs = require('fs');

describe('webpack-concat-files-plugin', function() {

  describe(`webpack ${WEBPACK_VERSION}`, function() {

    describe('regular mode', function() {
      let result_err;
      let result_stats;

      // Run Webpack once, and use tests to examine results.
      before(function(done) {
        this.timeout(WEBPACK_TIMEOUT);
        webpack(config, function(err, stats) {
          result_err = err;
          result_stats = stats;
          done();
        });
      });

      // Confirm that Webpack compilation does not result in an error.
      it('should not error', function() {
        expect(result_err).to.be.a('null');
      });

      // Confirm that Webpack compilation returns a `stats` object.
      it('should return a `stats` object', function() {
        expect(result_stats).to.not.be.an('undefined');
      });

      // Confirm that `stats` object does not have any errors.
      it('should not list any errors in the `stats` object', function() {
        expect(result_stats.hasErrors()).to.be.false;
      });

      // Confirm that each concatenated file bundle was listed in compilation asset array.
      it('should contain an asset for each concatenated file bundle', function() {
        const assets = result_stats.toJson().assets.map((asset) => asset.name);
        expect(assets).to.be.an('array').that.includes('concat-files/concat-a.js');
        expect(assets).to.be.an('array').that.includes('concat-files/concat-b.js');
        expect(assets).to.be.an('array').that.includes('concat-files/concat-c.js');
      });

      // Confirm that basic concatenated bundle output matches expected content.
      it('should contain the correct content for basic concatenated bundle', function() {
        const asset = result_stats.compilation.assets['concat-files/concat-a.js'];
        const source = asset.source();
        const expected = `console.log("Hello, world A");

console.log("Hello, world B");

console.log("Hello, world C");
`;
        expect(source).to.be.a('string');
        expect(source).to.equal(expected);
      });

      // Confirm that concatenation with transformations matches expected content.
      it('should contain the correct content for transformed concatenated bundle', function() {
        const asset = result_stats.compilation.assets['concat-files/concat-b.js'];
        const source = asset.source();
        const expected = `/* COMMENT */console.log('A');/* COMMENT */console.log('B');`;
        expect(source).to.be.a('string');
        expect(source).to.equal(expected);
      });

      // Confirm that concatenation with custom separator string matches expected content.
      it('should contain the correct content for concatenated bundle with custom separator', function() {
        const asset = result_stats.compilation.assets['concat-files/concat-c.js'];
        const source = asset.source();
        const expected = `console.log('A');
/* ENDFILE */
console.log('B');
`;
        expect(source).to.be.a('string');
        expect(source).to.equal(expected);
      });
    });

    describe('watch mode', function() {
      let watching;
      let result_err;
      let result_stat;

      beforeEach(function(done) {
        this.timeout(WEBPACK_TIMEOUT);
        const compiler = webpack(config);
        watching = compiler.watch({
          aggregateTimeout: 300,
          poll: undefined,
        }, function(err, stats) {
          result_err = err;
          result_stats = stats;
          done();
        });
      });

      // Confirm that Webpack compilation does not result in an error.
      it('should not error', function() {
        expect(result_err).to.be.a('null');
      });

      // Confirm that Webpack compilation returns a `stats` object.
      it('should return a `stats` object', function() {
        expect(result_stats).to.not.be.an('undefined');
      });

      afterEach(function(done) {
        this.timeout(WEBPACK_TIMEOUT);
        watching.close(function() {
          watching = undefined;
          result_err = undefined;
          result_stat = undefined;
          done();
        });
      });
    });
  });
});
