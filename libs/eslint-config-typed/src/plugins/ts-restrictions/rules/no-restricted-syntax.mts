import { type Rule } from 'eslint';
import type * as ESTree from 'estree';

export const noRestrictedSyntax: Rule.RuleModule = {
  meta: {
    type: 'suggestion',

    docs: {
      description: 'Disallow specified syntax',
      recommended: false,
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
  },

  create: (context: DeepReadonly<Rule.RuleContext>) =>
    context.options.reduce(
      (result: UnknownRecord, selectorOrObject: unknown) => {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        const selectorOrObjectCasted = selectorOrObject as
          | string
          | Readonly<{ selector: string; message?: string }>;

        const isStringFormat = typeof selectorOrObjectCasted === 'string';

        const hasCustomMessage =
          !isStringFormat && isNonEmptyString(selectorOrObjectCasted.message);

        const selector = isStringFormat
          ? selectorOrObjectCasted
          : selectorOrObjectCasted.selector;

        const message = hasCustomMessage
          ? selectorOrObjectCasted.message
          : `Using '${selector}' is not allowed.`;

        // eslint-disable-next-line functional/immutable-data
        return Object.assign(result, {
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          [selector]: (node: ESTree.Node) => {
            context.report({
              node,
              messageId: 'restrictedSyntax',
              data: { message },
            });
          },
        });
      },
      {},
    ),
} as const;

const isNonEmptyString = (u: unknown): u is string =>
  typeof u === 'string' && u !== '';
