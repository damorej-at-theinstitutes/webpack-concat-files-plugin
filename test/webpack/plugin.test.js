const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const plugin = require('../../src/index.js');
const webpack = require('webpack');
const config = require('./test-project/webpack.config.js');
const promisify = require('util').promisify;
const MemoryFs = require('memory-fs');
const testFilesystem = require('./testfs.js');

/*
 * Set up `fs` object for Webpack 4 and Webpack 5.
 * This has changed slightly between Webpack 4 and Webpack 5 so must be
 * handled accordingly.
 */
const fs = (() => {
  if (WEBPACK_VERSION === 4) {
    // Webpack 4
    const memoryFs = new MemoryFs();
    Object.keys(testFilesystem).forEach((testFilesystemKey) => {
      memoryFs.mkdirpSync(path.dirname(testFilesystemKey));
      memoryFs.writeFileSync(testFilesystemKey, testFilesystem[testFilesystemKey], 'utf8');
    });
    return memoryFs;
  }
  else {
    // Webpack 5
  }
})();

describe('webpack-concat-files-plugin', function() {

  describe(`webpack ${WEBPACK_VERSION}`, function() {

    describe('regular mode', function() {
      let result_err;
      let result_stats;

      // Run Webpack once, and use tests to examine results.
      before(function(done) {
        this.timeout(WEBPACK_TIMEOUT);
        const compiler = webpack(config);
        compiler.inputFileSystem = fs;
        compiler.outputFileSystem = fs;
        compiler.run(function(err, stats) {
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
      let compiler;
      let result_err;
      let result_stats;

      const subsequentRunCallback = () => {
      };

      beforeEach(function(done) {
        this.timeout(WEBPACK_TIMEOUT);
        compiler = webpack(config);
        compiler.inputFileSystem = fs;
        compiler.outputFileSystem = fs;
        compiler.resolvers.normal.fileSystem = compiler.inputFileSystem;
        compiler.resolvers.context.fileSystem = compiler.inputFileSystem;
        watching = compiler.watch({
          aggregateTimeout: 300,
          poll: undefined,
        }, function(err, stats) {
          const firstRun = (!result_err && !result_stats);
          result_err = err;
          result_stats = stats;
          if (firstRun) {
            done();
          }
          else {
            subsequentRunCallback();
          }
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

      it('bleh?', function(done) {
        this.timeout(WEBPACK_TIMEOUT + 1000);
        const delPath = path.resolve(__dirname, './test-project/src/concat-files/a/1.js');
        const delPath2 = path.resolve(__dirname, './test-project/src/concat-files/a/2.js');

        //watching.run();

        const testFilesystem = require('./testfs.js');
        const nfs = createFsFromVolume(Volume.fromJSON(testFilesystem));
        console.log(fs.existsSync(path.resolve(__dirname, './test-project/src/concat-files/a/4.js')));
        console.log(fs.existsSync(delPath));
        //fs.unlinkSync(path.resolve(__dirname, './test-project/src/index.js'));
        fs.unlinkSync(delPath);
        fs.unlinkSync(delPath2);
        fs.writeFileSync(path.resolve(__dirname, './test-project/src/concat-files/b/1.js'), 'console.log(\'AAA\');');
        fs.writeFileSync(path.resolve(__dirname, './test-project/src/concat-files/a/4.js'), 'loser');
        console.log(fs.existsSync(path.resolve(__dirname, './test-project/src/concat-files/a/4.js')));
        console.log(fs.existsSync(delPath));
        watching.invalidate();

        setTimeout(() => {
          //console.log(nfs.readFileSync(path.resolve(__dirname, './test-project/dist/concat-files/concat-a.js'), 'utf8'));
          //console.log(result_stats);
          console.log(result_stats.compilation.assets);
          done();
        }, 5000)
        //expect(run_spy).to.have.been.called;
        //expect(true).to.be.true;
      });

      afterEach(function(done) {
        this.timeout(WEBPACK_TIMEOUT);
        watching.close(function() {
          watching = undefined;
          compiler = undefined;
          result_err = undefined;
          result_stats = undefined;
          done();
        });
      });
    });
  });
});
