import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { inlineTypeQualifierRange } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';

type Options = readonly [];

type MessageIds = 'useTopLevelQualifier' | 'importFromDeclaration';

/**
 * The export-side twin of `@typescript-eslint/no-import-type-side-effects`.
 *
 * Under `verbatimModuleSyntax`, TypeScript drops each inline `type` specifier
 * of `export { type A } from 'm'` and keeps the declaration, so a re-export
 * whose specifiers are all inline `type` is emitted as `export {} from 'm'`: a
 * runtime load of `m`, which fails at module load when `m` is a types-only
 * package with no JavaScript entry. `export type { A } from 'm'` is erased
 * whole. A declaration with no `from` is left alone, since `export {}` loads
 * nothing, and so is one in a declaration file or a `declare module` block,
 * where nothing is emitted.
 *
 * The fix removes each inline `type` and adds one after `export`. A re-export
 * with import attributes (`with { type: 'json' }`) gets its own message and no
 * fix, since TypeScript rejects attributes on a type-only re-export (TS2857):
 * its types are better imported from where they are declared.
 */
export const noExportTypeSideEffects: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Enforce a top-level `export type` qualifier on a re-export whose specifiers all have inline `type` qualifiers',
      },
      fixable: 'code',
      schema: [],
      messages: {
        useTopLevelQualifier:
          "Under `verbatimModuleSyntax`, TypeScript removes only the inline type specifiers, which leaves `export {} from '…'` behind: a runtime import. Write `export type { … } from '…'` instead.",
        importFromDeclaration:
          "Under `verbatimModuleSyntax`, TypeScript removes only the inline type specifiers, which leaves `export {} from '…' with { … }` behind: a runtime import. A type-only re-export cannot carry import attributes, so re-export these types from the module that declares them.",
      },
      defaultOptions: [],
    },

    create: (context) => {
      if (/\.d\.[cm]?ts$/u.test(context.filename)) {
        return {};
      }

      const { sourceCode } = context;

      return {
        ExportNamedDeclaration: (node) => {
          if (
            node.source === null ||
            node.exportKind === 'type' ||
            Arr.isEmpty(node.specifiers) ||
            node.specifiers.some((s) => s.exportKind !== 'type') ||
            sourceCode
              .getAncestors(node)
              .some((a) => a.type === AST_NODE_TYPES.TSModuleDeclaration)
          ) {
            return;
          }

          if (Arr.isNonEmpty(node.attributes)) {
            context.report({ node, messageId: 'importFromDeclaration' });

            return;
          }

          // The declaration starts with `export`, and each specifier with its
          // `type`, so neither lookup comes back empty.
          const exportKeyword = sourceCode.getFirstToken(node);

          const qualifierRanges = Arr.generate(function* () {
            for (const specifier of node.specifiers) {
              const range = inlineTypeQualifierRange(sourceCode, specifier);

              if (range !== undefined) {
                yield range;
              }
            }
          });

          context.report({
            node,
            messageId: 'useTopLevelQualifier',
            fix:
              exportKeyword === null ||
              qualifierRanges.length !== node.specifiers.length
                ? null
                : (fixer) =>
                    Arr.toPushed(
                      qualifierRanges.map((range) => fixer.removeRange(range)),
                      fixer.insertTextAfter(exportKeyword, ' type'),
                    ),
          });
        },
      };
    },
  } as const;
