import { type TSESLint } from '@typescript-eslint/utils';
import {
  DEFAULT_IMPORT_STYLE,
  IMPORT_STYLE_SCHEMA_PROPERTY,
} from './import-style.mjs';
import {
  reportStdTypeReference,
  type StdTypeAlternatives,
} from './std-type-rule-utils.mjs';

type Options = readonly [
  Readonly<{
    importStyle?: 'global' | 'named';
  }>?,
];

type MessageIds = 'useReadonlyOrMutableRecord' | 'replaceWith';

/**
 * `Record` says nothing about whether the properties may be reassigned, so the
 * mutability of every record type spelled with it is decided by whoever reads
 * it. The ts-type-forge pair spells it out.
 */
const ALTERNATIVES: StdTypeAlternatives = new Map([
  ['Record', ['ReadonlyRecord', 'MutableRecord']],
]);

export const preferReadonlyOrMutableRecord: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace the built-in `Record` with the ts-type-forge `ReadonlyRecord` or `MutableRecord`, so that the mutability of the record is stated rather than implied.',
    },
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          importStyle: IMPORT_STYLE_SCHEMA_PROPERTY,
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useReadonlyOrMutableRecord:
        'Use {{alternatives}} from ts-type-forge instead of the built-in `{{name}}`.',
      replaceWith: 'Replace `{{name}}` with `{{replacement}}`.',
    },
  },

  create: (context) => {
    const importStyle = context.options[0]?.importStyle ?? DEFAULT_IMPORT_STYLE;

    return {
      TSTypeReference: (node) => {
        reportStdTypeReference(
          context,
          node,
          ALTERNATIVES,
          {
            report: 'useReadonlyOrMutableRecord',
            suggestion: 'replaceWith',
          },
          importStyle,
        );
      },
    };
  },
  defaultOptions: [{ importStyle: DEFAULT_IMPORT_STYLE }],
} as const;
