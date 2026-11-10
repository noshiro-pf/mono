import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

type Selector = string | Readonly<{ selector: string; message?: string }>;

/** Every selector is an option of its own: `['error', 'A', { selector: 'B' }]`. */
type Options = readonly Selector[];

type MessageIds = 'restrictedSyntax';

/**
 * ESLint's `no-restricted-syntax` under another id, so that a config can add a
 * set of selectors at a severity of its own without restating the core rule's:
 * a later config entry replaces a rule's options whole.
 */
export const noRestrictedSyntax: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',

    docs: {
      description: 'Disallow specified syntax',
      url: 'https://eslint.org/docs/latest/rules/no-restricted-syntax',
    },

    schema: {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              selector: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['selector'],
            additionalProperties: false,
          },
        ],
      },
      uniqueItems: true,
      minItems: 0,
    },

    messages: {
      restrictedSyntax: '{{message}}',
    },

    defaultOptions: [],
  },

  create: (context) =>
    Object.fromEntries(
      context.options.map((selectorOrObject) => {
        const { selector, message } =
          typeof selectorOrObject === 'string'
            ? { selector: selectorOrObject, message: undefined }
            : selectorOrObject;

        const reported =
          message === undefined || message === ''
            ? `Using '${selector}' is not allowed.`
            : message;

        return [
          selector,
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          (node: TSESTree.Node): void => {
            context.report({
              node,
              messageId: 'restrictedSyntax',
              data: { message: reported },
            });
          },
        ] as const;
      }),
    ),
} as const;
