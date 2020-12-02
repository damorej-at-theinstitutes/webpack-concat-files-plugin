const arraysEqual = require('../../../src/util/arrays-equal.js');

const chai = require('chai');
const expect = chai.expect;

/*
 * Tests for arraysEqual() function.
 */
describe('arraysEqual()', function() {

  // Ensure `false` is returned if arrays have different lengths.
  it('returns `false` when arrays have different lengths', function() {
    const arrayA = ['a', 'b', 'c'];
    const arrayB = ['a', 'b', 'c', 'd'];

    expect(arrayA.length).to.not.equal(arrayB.length);
    expect(arraysEqual(arrayA, arrayB)).to.be.false;
  });

  // Ensure `true` is returned if arrays have the same values.
  it('returns `true` when arrays have the same values', function() {
    const arrayA1 = ['a', 'b', 'c'];
    const arrayB1 = ['a', 'b', 'c'];
    const arrayA2 = ['1', '2', '3', '4', '5'];
    const arrayB2 = ['1', '2', '3', '4', '5'];
    const arrayA3 = [1, 2, 3];
    const arrayB3 = [1, 2, 3];
    const arrayA4 = [true, false, true, false];
    const arrayB4 = [true, false, true, false];

    expect(arrayA1).to.eql(arrayB1);
    expect(arraysEqual(arrayA1, arrayB1)).to.be.true;
    expect(arrayA2).to.eql(arrayB2);
    expect(arraysEqual(arrayA2, arrayB2)).to.be.true;
    expect(arrayA3).to.eql(arrayB3);
    expect(arraysEqual(arrayA3, arrayB3)).to.be.true;
    expect(arrayA4).to.eql(arrayB4);
    expect(arraysEqual(arrayA4, arrayB4)).to.be.true;
  });

  // Ensure `false` is returned if arrays have different values.
  it('returns `false` when arrays have different values', function() {
    const arrayA1 = ['a', 'b', 'c'];
    const arrayB1 = ['a', 'b', 'c', 'd'];
    const arrayA2 = ['1', '2', '3', '4', '5'];
    const arrayB2 = [1, 2, 3, 4, 5];
    const arrayA3 = [1, 2, 3];
    const arrayB3 = ["a", false, 3];
    const arrayA4 = [true, false, true, false];
    const arrayB4 = [true, false, true, true];

    expect(arrayA1).to.not.eql(arrayB1);
    expect(arraysEqual(arrayA1, arrayB1)).to.be.false;
    expect(arrayA2).to.not.eql(arrayB2);
    expect(arraysEqual(arrayA2, arrayB2)).to.be.false;
    expect(arrayA3).to.not.eql(arrayB3);
    expect(arraysEqual(arrayA3, arrayB3)).to.be.false;
    expect(arrayA4).to.not.eql(arrayB4);
    expect(arraysEqual(arrayA4, arrayB4)).to.be.false;
  });
});
