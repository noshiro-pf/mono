import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useRangeForLoop';

export const preferRangeForLoop: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `for (let i = begin; i < end; ++i)` with `for (const i of range(begin, end))` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useRangeForLoop:
        'Replace with `for (const {{varName}} of range({{begin}}, {{end}}))` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const mut_nodesToFix: {
      node: TSESTree.ForStatement;
      varName: string;
      begin: string;
      end: string;
      step?: string;
    }[] = [];

    return {
      ForStatement: (node) => {
        // Check init: let i = begin
        if (
          node.init?.type !== AST_NODE_TYPES.VariableDeclaration ||
          node.init.kind !== 'let' ||
          !Arr.isArrayOfLength(node.init.declarations, 1)
        ) {
          return;
        }

        const declaration = node.init.declarations[0];

        if (
          declaration.id.type !== AST_NODE_TYPES.Identifier ||
          declaration.init === null
        ) {
          return;
        }

        const varName = declaration.id.name;

        const beginExpr = declaration.init;

        // Check test: i < end
        if (
          node.test?.type !== AST_NODE_TYPES.BinaryExpression ||
          node.test.operator !== '<' ||
          node.test.left.type !== AST_NODE_TYPES.Identifier ||
          node.test.left.name !== varName
        ) {
          return;
        }

        const endExpr = node.test.right;

        // Check update: ++i, i++, i += 1, or i += step
        if (node.update === null) return;

        let mut_step: string | undefined;

        if (node.update.type === AST_NODE_TYPES.UpdateExpression) {
          // ++i or i++
          if (
            node.update.operator === '++' &&
            node.update.argument.type === AST_NODE_TYPES.Identifier &&
            node.update.argument.name === varName
          ) {
            mut_step = undefined; // step defaults to 1
          } else {
            return;
          }
        } else if (
          node.update.type === AST_NODE_TYPES.AssignmentExpression &&
          node.update.operator === '+=' &&
          node.update.left.type === AST_NODE_TYPES.Identifier &&
          node.update.left.name === varName
        ) {
          // i += step
          const stepValue = node.update.right;

          if (stepValue.type === AST_NODE_TYPES.Literal) {
            const stepNum = stepValue.value;

            // Only support positive integer steps
            if (typeof stepNum === 'number' && stepNum > 0) {
              mut_step = stepNum === 1 ? undefined : String(stepNum);
            } else {
              return;
            }
          } else {
            // Variable step like i += step
            mut_step = sourceCode.getText(stepValue);
          }
        } else {
          return;
        }

        const beginText = sourceCode.getText(beginExpr);

        const endText = sourceCode.getText(endExpr);

        mut_nodesToFix.push({
          node,
          varName,
          begin: beginText,
          end: endText,
          step: mut_step,
        });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImport);

        const hasRangeImport = namedImports.includes('range');

        for (const [
          index,
          { node, varName, begin, end, step },
        ] of mut_nodesToFix.entries()) {
          context.report({
            node: node.init ?? node,
            messageId: 'useRangeForLoop',
            data: {
              varName,
              begin,
              end,
            },
            fix: (fixer) => {
              const bodyText = sourceCode.getText(node.body);

              const rangeArgs =
                step === undefined
                  ? `${begin}, ${end}`
                  : `${begin}, ${end}, ${step}`;

              const replacement = `for (const ${varName} of range(${rangeArgs})) ${bodyText}`;

              const importFixes =
                index === 0 && !hasRangeImport
                  ? buildImportFixes(fixer, program, tsDataForgeImport, [
                      'range',
                    ])
                  : [];

              return [...importFixes, fixer.replaceText(node, replacement)];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;
