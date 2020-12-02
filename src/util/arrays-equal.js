/**
 * Determines if two arrays have the same values.
 *
 * Only applicable with arrays which contain basic types.
 */
const arraysEqual = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  const aExtra = a.some((value) => {
    return !(b.includes(value));
  });
  const bExtra = b.some((value) => {
    return !(a.includes(value));
  });
  return !(aExtra || bExtra);
}

module.exports = arraysEqual;
