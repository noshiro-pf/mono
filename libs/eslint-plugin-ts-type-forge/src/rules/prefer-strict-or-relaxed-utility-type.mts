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

type MessageIds = 'useStrictOrRelaxed' | 'replaceWith';

/**
 * The standard-library types whose second argument is unchecked, and the
 * ts-type-forge pair that makes the choice explicit.
 *
 * `Strict*` constrains the second argument (`U extends T` / `K extends keyof T`),
 * so a key that does not exist — typically a leftover after a rename — is a
 * compile error instead of a silently empty result. `Relaxed*` keeps the
 * standard-library behavior for the cases that genuinely need it (a subtrahend
 * that is not provably part of the union, a key set computed from a still
 * deferred type parameter).
 */
const ALTERNATIVES: StdTypeAlternatives = new Map([
  ['Exclude', ['StrictExclude', 'RelaxedExclude']],
  ['Extract', ['StrictExtract', 'RelaxedExtract']],
  ['Omit', ['StrictOmit', 'RelaxedOmit']],
  ['Pick', ['StrictPick', 'RelaxedPick']],
]);

export const preferStrictOrRelaxedUtilityType: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace the built-in `Exclude` / `Extract` / `Omit` / `Pick` with the ts-type-forge `Strict*` or `Relaxed*` counterpart, so that the unchecked second argument becomes an explicit choice.',
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
      useStrictOrRelaxed:
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
          { report: 'useStrictOrRelaxed', suggestion: 'replaceWith' },
          importStyle,
        );
      },
    };
  },
  defaultOptions: [{ importStyle: DEFAULT_IMPORT_STYLE }],
} as const;
