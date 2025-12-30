import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useIsRecordAndHasKey';

export const preferIsRecordAndHasKey: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Replace `Object.hasOwn(obj, key)` or `key in obj` with `isRecord(obj) && hasKey(obj, key)` from ts-data-forge',
      },
      fixable: 'code',
      schema: [],
      messages: {
        useIsRecordAndHasKey:
          'Replace `{{original}}` with `isRecord({{objName}}) && hasKey({{objName}}, {{keyName}})` from ts-data-forge.',
      },
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const tsDataForgeImport = getTsDataForgeImport(program);

      const mut_nodesToFix: {
        node: TSESTree.CallExpression | TSESTree.BinaryExpression;
        objExpression: TSESTree.Expression;
        keyExpression: TSESTree.Expression;
      }[] = [];

      return {
        // Handle Object.hasOwn(obj, key)
        CallExpression: (node) => {
          if (
            node.callee.type !== AST_NODE_TYPES.MemberExpression ||
            node.callee.object.type !== AST_NODE_TYPES.Identifier ||
            node.callee.object.name !== 'Object' ||
            node.callee.property.type !== AST_NODE_TYPES.Identifier ||
            node.callee.property.name !== 'hasOwn'
          ) {
            return;
          }

          // Check arguments: Object.hasOwn(obj, key)
          if (node.arguments.length !== 2) return;

          const objArg = node.arguments[0];

          const keyArg = node.arguments[1];

          if (objArg === undefined || keyArg === undefined) return;

          // Type guard: ensure arguments are Expressions (not SpreadElement)
          if (
            objArg.type === AST_NODE_TYPES.SpreadElement ||
            keyArg.type === AST_NODE_TYPES.SpreadElement
          ) {
            return;
          }

          mut_nodesToFix.push({
            node,
            objExpression: objArg,
            keyExpression: keyArg,
          });
        },

        // Handle key in obj
        BinaryExpression: (node) => {
          if (node.operator !== 'in') return;

          const keyExpression = node.left;

          const objExpression = node.right;

          // Type guard: ensure keyExpression is Expression (not PrivateIdentifier)
          if (keyExpression.type === AST_NODE_TYPES.PrivateIdentifier) return;

          mut_nodesToFix.push({
            node,
            objExpression,
            keyExpression,
          });
        },

        'Program:exit': () => {
          const namedImports = getNamedImports(tsDataForgeImport);

          const hasIsRecordImport = namedImports.includes('isRecord');

          const hasHasKeyImport = namedImports.includes('hasKey');

          for (const [
            index,
            { node, objExpression, keyExpression },
          ] of mut_nodesToFix.entries()) {
            const objText = sourceCode.getText(objExpression);

            const keyText = sourceCode.getText(keyExpression);

            const originalText = sourceCode.getText(node);

            context.report({
              node,
              messageId: 'useIsRecordAndHasKey',
              data: {
                original: originalText,
                objName: objText,
                keyName: keyText,
              },
              fix: (fixer) => {
                const replacement = `isRecord(${objText}) && hasKey(${objText}, ${keyText})`;

                const importsToAdd: string[] = [];

                if (!hasIsRecordImport) {
                  // eslint-disable-next-line functional/immutable-data
                  importsToAdd.push('isRecord');
                }

                if (!hasHasKeyImport) {
                  // eslint-disable-next-line functional/immutable-data
                  importsToAdd.push('hasKey');
                }

                const importFixes =
                  index === 0 && importsToAdd.length > 0
                    ? buildImportFixes(
                        fixer,
                        program,
                        tsDataForgeImport,
                        importsToAdd,
                      )
                    : [];

                return [...importFixes, fixer.replaceText(node, replacement)];
              },
            });
          }
        },
      };
    },
    defaultOptions: [],
  };
