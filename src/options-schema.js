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
  },
  required: [],
  additionalProperties: false,
};
