/**
 * Performs content concatenation and transformation.
 */
class ConcatenationHandler {

  /**
   * Constructor.
   *
   * @param {string} separator - Separator between items in concatenated output.
   * @param {object=} transforms - Transform callbacks for concatenation.
   * @param {function=} transforms.before - Transform to apply to each item before concatenation.
   * @param {function=} transforms.after - Transform to apply to concatenated output.
   */
  constructor(separator, transforms) {
    /// String which separates each piece of content within concatenated output.
    this.separator = separator;

    /// Object containing functions which transform concatenated output.
    this.transforms = transforms;
  }

  /**
   * Concatenate an array of ConcatenationItems.
   *
   * If transformations have been specified, they will be applied as well.
   *
   * @param {Object[]} items - Array of ConcatenationItems to concatenate.
   *
   * @returns {Promise} Promise resolving to string of concatenated content.
   */
  async concatenate(items) {
    const transformedPromises = items
      .map((item) => {
        return this._applyBeforeTransform(item)
      });

    const separator = this.separator;
    const transformedContent = await Promise.all(transformedPromises);
    const concatenatedContent = transformedContent.reduce((acc, cur) => {
      if (acc.length) {
        return `${acc}${separator}${cur}`
      }
      return cur;
    }, '');

    return this._applyAfterTransform(concatenatedContent);
  }

  /**
   * Applies before transformation if one exists and returns the output.
   *
   * If no before transformation exists, the item content is returned unchanged.
   *
   * @param {Object} item - Concatenation item to transform.
   * @param {string} item.content - Concatenation item content.
   * @param {string} item.filepath - Concatenation item source filepath.
   *
   * @returns {Promise} Promise resolving to string of transformed content.
   */
  async _applyBeforeTransform(item) {
    if (this.transforms && this.transforms.before) {
      return this.transforms.before(item.content, item.filepath);
    }
    // Leave content unchanged if no transform exists.
    return item.content;
  }

  /**
   * Applies after transformation if one exists and returns the output.
   *
   * If no after transformation exists, the concatenation content is returned
   * unchanged.
   *
   * @param {string} concatenationOutput - Concatenated content.
   *
   * @returns {string} Promise resolving to transformed concatenated content.
   */
  async _applyAfterTransform(concatenationOutput) {
    if (this.transforms && this.transforms.after) {
      return this.transforms.after(concatenationOutput);
    }
    // Leave content unchanged if no transform exists.
    return concatenationOutput;
  }
}

module.exports = ConcatenationHandler;
