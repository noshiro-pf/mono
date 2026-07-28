import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { getNonEmptyArrayElementText } from './ast-utils.mjs';
import {
  NON_EMPTY_ARRAY_TYPE_NAME,
  TS_TYPE_FORGE_MODULE,
} from './constants.mjs';
import {
  buildTypeImportFix,
  getImportedLocalName,
  getTsTypeForgeImports,
  hasConflictingDeclaration,
} from './import-utils.mjs';

type ImportStyle = 'global' | 'named';

type Options = readonly [
  Readonly<{
    importStyle?: ImportStyle;
  }>?,
];

type MessageIds = 'useNonEmptyArray';

const DEFAULT_IMPORT_STYLE: ImportStyle = 'global';

export const preferNonEmptyArray: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace the `readonly [V, ...V[]]` tuple spelling with `NonEmptyArray<V>` from ts-type-forge.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          importStyle: {
            type: 'string',
            enum: ['global', 'named'],
            description: [
              'How `NonEmptyArray` is brought into scope.',
              "'global' (default) assumes the ambient globals of",
              '`ts-type-forge/global` and never touches imports;',
              "'named' makes the autofix add",
              `\`import { type ${NON_EMPTY_ARRAY_TYPE_NAME} } from '${TS_TYPE_FORGE_MODULE}';\``,
              'when the name is not imported yet.',
            ].join(' '),
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useNonEmptyArray:
        'Replace `{{original}}` with `{{replacement}}` from ts-type-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    // `context.options` is what the user actually configured; `defaultOptions`
    // is only merged in by `RuleCreator`, which plain rule objects do not use.
    const importStyle = context.options[0]?.importStyle ?? DEFAULT_IMPORT_STYLE;

    const importedLocalName = getImportedLocalName(
      getTsTypeForgeImports(program),
      NON_EMPTY_ARRAY_TYPE_NAME,
    );

    const mut_nodesToFix: {
      node: TSESTree.TSTypeOperator;
      elementText: string;
    }[] = [];

    return {
      TSTypeOperator: (node) => {
        const elementText = getNonEmptyArrayElementText(node, sourceCode);

        if (elementText === undefined) return;

        mut_nodesToFix.push({ node, elementText });
      },
      'Program:exit': () => {
        if (mut_nodesToFix.length === 0) return;

        // Rewriting to `NonEmptyArray<...>` is only sound when that name is
        // free (or already bound to the ts-type-forge export). Otherwise the
        // rewritten type would resolve to the wrong declaration — most
        // notably inside ts-type-forge's own sources, which define
        // `NonEmptyArray`.
        if (
          importedLocalName === undefined &&
          hasConflictingDeclaration(program, NON_EMPTY_ARRAY_TYPE_NAME)
        ) {
          return;
        }

        const localName = importedLocalName ?? NON_EMPTY_ARRAY_TYPE_NAME;

        const needsImport =
          importStyle === 'named' && importedLocalName === undefined;

        for (const [index, { node, elementText }] of mut_nodesToFix.entries()) {
          const replacement = `${localName}<${elementText}>`;

          context.report({
            node,
            messageId: 'useNonEmptyArray',
            data: {
              original: sourceCode.getText(node),
              replacement,
            },
            fix: (fixer) => [
              ...(index === 0 && needsImport
                ? buildTypeImportFix(fixer, program, NON_EMPTY_ARRAY_TYPE_NAME)
                : []),
              fixer.replaceText(node, replacement),
            ],
          });
        }
      },
    };
  },
  defaultOptions: [{ importStyle: DEFAULT_IMPORT_STYLE }],
} as const;
