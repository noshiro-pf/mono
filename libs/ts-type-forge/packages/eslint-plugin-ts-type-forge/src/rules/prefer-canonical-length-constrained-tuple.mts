import { type TSESLint } from '@typescript-eslint/utils';
import { analyzeUniformTuple, type UniformTupleShape } from './ast-utils.mjs';
import {
  DEFAULT_MAX_TUPLE_LENGTH,
  FIXED_LENGTH_TUPLE_TYPE_NAME,
  MIN_LENGTH_TUPLE_TYPE_NAME,
  MUTABLE_FIXED_LENGTH_TUPLE_TYPE_NAME,
  MUTABLE_MIN_LENGTH_TUPLE_TYPE_NAME,
  MUTABLE_NON_EMPTY_TUPLE_TYPE_NAME,
  NON_EMPTY_TUPLE_TYPE_NAME,
} from './constants.mjs';
import {
  DEFAULT_IMPORT_STYLE,
  IMPORT_STYLE_SCHEMA_PROPERTY,
  reportTupleRewrites,
  type TupleRewrite,
} from './tuple-rule-utils.mjs';

type Options = readonly [
  Readonly<{
    importStyle?: 'global' | 'named';
    maxLength?: number;
  }>?,
];

type MessageIds = 'useCanonicalTuple';

/**
 * A single fixed element without a rest (`[V]`) is left alone: it reads better
 * than `FixedLengthTuple<1, V>`.
 */
const MIN_FIXED_LENGTH = 2;

export const preferCanonicalLengthConstrainedTuple: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace uniform tuple spellings such as `[V, ...V[]]` / `[V, V, ...V[]]` / `[V, V, V]` with the canonical ts-type-forge tuple type.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          importStyle: IMPORT_STYLE_SCHEMA_PROPERTY,
          maxLength: {
            type: 'integer',
            minimum: MIN_FIXED_LENGTH,
            description: [
              'Longest tuple the rule rewrites (default',
              `${DEFAULT_MAX_TUPLE_LENGTH}).`,
              'Longer tuples are usually spelled out on purpose, and the named',
              'form stops being more readable.',
            ].join(' '),
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useCanonicalTuple:
        'Replace `{{original}}` with `{{replacement}}` from ts-type-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const options = context.options[0];

    const importStyle = options?.importStyle ?? DEFAULT_IMPORT_STYLE;

    const maxLength = options?.maxLength ?? DEFAULT_MAX_TUPLE_LENGTH;

    const mut_rewrites: TupleRewrite[] = [];

    return {
      TSTupleType: (node) => {
        const shape = analyzeUniformTuple(node, sourceCode);

        if (shape === undefined || shape.fixedCount > maxLength) return;

        const canonicalName = canonicalNameFor(shape);

        if (canonicalName === undefined) return;

        mut_rewrites.push({
          node: shape.node,
          canonicalName,
          typeArgs:
            shape.fixedCount === 1
              ? shape.elementText
              : `${shape.fixedCount}, ${shape.elementText}`,
        });
      },
      'Program:exit': () => {
        reportTupleRewrites(
          context,
          mut_rewrites,
          'useCanonicalTuple',
          importStyle,
        );
      },
    };
  },
  defaultOptions: [
    { importStyle: DEFAULT_IMPORT_STYLE, maxLength: DEFAULT_MAX_TUPLE_LENGTH },
  ],
} as const;

/**
 * The ts-type-forge type a given tuple shape spells out, or `undefined` when the
 * shape is deliberately left alone.
 *
 * | shape                 | readonly            | mutable                    |
 * | :-------------------- | :------------------ | :------------------------- |
 * | `[V, ...V[]]`         | `NonEmptyTuple`     | `MutableNonEmptyTuple`     |
 * | `[V, …×N, ...V[]]`    | `MinLengthTuple`    | `MutableMinLengthTuple`    |
 * | `[V, …×N]` (N >= 2)   | `FixedLengthTuple`  | `MutableFixedLengthTuple`  |
 */
const canonicalNameFor = (
  // `UniformTupleShape` carries a `TSESTree.Node`, which is not deeply readonly.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  shape: UniformTupleShape,
): string | undefined => {
  const { isReadonly, hasRest, fixedCount } = shape;

  if (hasRest) {
    if (fixedCount === 1) {
      return isReadonly
        ? NON_EMPTY_TUPLE_TYPE_NAME
        : MUTABLE_NON_EMPTY_TUPLE_TYPE_NAME;
    }

    return isReadonly
      ? MIN_LENGTH_TUPLE_TYPE_NAME
      : MUTABLE_MIN_LENGTH_TUPLE_TYPE_NAME;
  }

  if (fixedCount < MIN_FIXED_LENGTH) return undefined;

  return isReadonly
    ? FIXED_LENGTH_TUPLE_TYPE_NAME
    : MUTABLE_FIXED_LENGTH_TUPLE_TYPE_NAME;
};
