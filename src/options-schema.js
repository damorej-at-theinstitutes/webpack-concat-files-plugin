/*
 * JSON schema for plugin options.
 */
module.exports = {
  title: 'WebpackConcatFilesPlugin options schema',
  type: 'object',
  properties: {
    bundles: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          dest: {
            type: 'string',
          },
          // TODO Remove 'destination' schema property once 'destination' option is removed.
          destination: {
            type: 'string',
          },
          src: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
          },
          // TODO Remove 'source' schema property once 'source' option is removed.
          source: {
            anyOf: [
              {
                type: 'string',
              },
              {
                type: 'array',
                items: {
                  type: 'string',
                },
              },
            ],
          },
          transforms: {
            type: 'object',
            properties: {
              before: {
                instanceof: 'Function',
              },
              after: {
                instanceof: 'Function',
              },
            },
          },
          encoding: {
            type: 'string',
          },
        },
        // TODO Replace with 'required' once 'source' and 'destination' are removed.
        allOf: [
          {
            // Only one of 'src' and 'source' can be defined.
            oneOf: [
              {
                required: ['src'],
              },
              {
                required: ['source'],
              },
            ],
          },
          {
            // Only one of 'dest' and 'destination' can be defined.
            oneOf: [
              {
                required: ['dest'],
              },
              {
                required: ['destination'],
              },
            ],
          },
        ],
        additionalProperties: false,
      },
    },
    separator: {
      type: 'string',
    },
    allowWatch: {
      type: 'boolean',
    },
    allowOptimization: {
      type: 'boolean',
    },
  },
  required: [],
  additionalProperties: false,
};
