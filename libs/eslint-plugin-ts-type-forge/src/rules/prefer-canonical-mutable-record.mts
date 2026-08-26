import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { isLocallyBound } from './ast-utils.mjs';
import {
  DEFAULT_IMPORT_STYLE,
  IMPORT_STYLE_SCHEMA_PROPERTY,
} from './import-style.mjs';
import {
  getImportedLocalName,
  getTsTypeForgeImports,
} from './import-utils.mjs';
import { reportTypeRewrites, type TypeRewrite } from './rewrite-rule-utils.mjs';

type Options = readonly [
  Readonly<{
    importStyle?: 'global' | 'named';
  }>?,
];

type MessageIds = 'useMutableRecord';

/**
 * The record spellings that `Mutable<…>` collapses to `MutableRecord<K, V>`.
 * `Mutable` strips the `readonly` modifier from every property, so applied to
 * any of these it produces exactly the type `MutableRecord` spells directly.
 */
const WRAPPED_RECORD_NAMES = [
  'Record',
  'ReadonlyRecord',
  'MutableRecord',
] as const;

const MUTABLE_TYPE_NAME = 'Mutable';

const MUTABLE_RECORD_TYPE_NAME = 'MutableRecord';

export const preferCanonicalMutableRecord: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `Mutable<Record<K, V>>` (and `Mutable` applied to `ReadonlyRecord` / `MutableRecord`) with the canonical ts-type-forge `MutableRecord<K, V>`.',
    },
    fixable: 'code',
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
      useMutableRecord:
        'Replace `{{original}}` with `{{replacement}}` from ts-type-forge.',
    },
  },

  create: (context) => {
    const importStyle = context.options[0]?.importStyle ?? DEFAULT_IMPORT_STYLE;

    const sourceCode = context.sourceCode;

    const tsTypeForgeImports = getTsTypeForgeImports(sourceCode.ast);

    /**
     * Whether this reference denotes the ts-type-forge type `canonicalName` —
     * either through an import from ts-type-forge (aliases included) or as the
     * bare ambient global. A name bound to anything else in this file (a local
     * alias, an import from another module) denotes that declaration instead.
     * The built-in `Record` goes through the same check: ts-type-forge exports
     * no `Record`, so only the unbound global spelling matches.
     */
    const referencesTsTypeForgeType = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.TSTypeReference,
      canonicalName: string,
    ): boolean => {
      const typeName = node.typeName;

      // `ns.Mutable` / `import('…').Mutable` never denote the ts-type-forge type.
      if (typeName.type !== AST_NODE_TYPES.Identifier) return false;

      return (
        typeName.name ===
          getImportedLocalName(tsTypeForgeImports, canonicalName) ||
        (typeName.name === canonicalName &&
          !isLocallyBound(sourceCode, node, canonicalName))
      );
    };

    const mut_rewrites: TypeRewrite[] = [];

    return {
      TSTypeReference: (node) => {
        if (!referencesTsTypeForgeType(node, MUTABLE_TYPE_NAME)) return;

        const wrapped = node.typeArguments?.params;

        if (wrapped === undefined || !Arr.isFixedLengthArray(1, wrapped)) {
          return;
        }

        const record = wrapped[0];

        if (
          record.type !== AST_NODE_TYPES.TSTypeReference ||
          WRAPPED_RECORD_NAMES.every(
            (name) => !referencesTsTypeForgeType(record, name),
          )
        ) {
          return;
        }

        const recordTypeArgs = record.typeArguments?.params;

        if (
          recordTypeArgs === undefined ||
          !Arr.isFixedLengthArray(2, recordTypeArgs)
        ) {
          return;
        }

        const [K, V] = recordTypeArgs;

        mut_rewrites.push({
          node,
          canonicalName: MUTABLE_RECORD_TYPE_NAME,
          typeArgs: `${sourceCode.getText(K)}, ${sourceCode.getText(V)}`,
        });
      },
      'Program:exit': () => {
        reportTypeRewrites(
          context,
          mut_rewrites,
          'useMutableRecord',
          importStyle,
        );
      },
    };
  },
  defaultOptions: [{ importStyle: DEFAULT_IMPORT_STYLE }],
} as const;
