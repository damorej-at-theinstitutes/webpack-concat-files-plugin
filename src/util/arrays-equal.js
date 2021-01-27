/**
 * Determines if two arrays have the same values.
 *
 * Only applicable with arrays which contain primitive types.
 */
const arraysEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

module.exports = arraysEqual;
