import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useSafeParseFloat';

/**
 * Returns `true` when every constituent of `type` is string-like, i.e. the
 * type is assignable to the `string` parameter of `Num.safeParseFloat`. A
 * union such as `string | undefined` is rejected so the autofix never
 * produces a type error.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isStringType = (type: ts.Type): boolean => {
  const parts = type.isUnion() ? type.types : ([type] as const);

  return (
    parts.length > 0 &&
    parts.every((t) => (t.flags & ts.TypeFlags.StringLike) !== 0)
  );
};

/**
 * Detects `parseFloat(x)`, `Number.parseFloat(x)`, and `Number(x)` (when x
 * is typed as `string`) and replaces them with
 * `Result.unwrapOkOr(Num.safeParseFloat(x), Number.NaN)` (ts-data-forge).
 *
 * `Number(x)` is only flagged when x is purely a string type to avoid false
 * positives for `Number(someBoolean)` or `Number(someNumber)` uses.
 */
export const preferNumSafeParseFloat: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Replace `parseFloat(x)`, `Number.parseFloat(x)`, or `Number(x)` (when x is a string) with `Result.unwrapOkOr(Num.safeParseFloat(x), Number.NaN)` from ts-data-forge.',
      },
      fixable: 'code',
      schema: [],
      messages: {
        useSafeParseFloat:
          'Replace `{{original}}` with `Result.unwrapOkOr(Num.safeParseFloat({{argName}}), Number.NaN)` from ts-data-forge.',
      },
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const program = sourceCode.ast;

      const tsDataForgeImport = getTsDataForgeImport(program);

      const services = context.sourceCode.parserServices;

      const mut_nodesToFix: {
        node: TSESTree.CallExpression;
        argExpression: TSESTree.Expression;
      }[] = [];

      return {
        CallExpression: (node) => {
          const { callee } = node;

          // Match `parseFloat(...)` (global function).
          const isGlobalParseFloat =
            callee.type === AST_NODE_TYPES.Identifier &&
            callee.name === 'parseFloat';

          // Match `Number.parseFloat(...)`.
          const isNumberParseFloat =
            callee.type === AST_NODE_TYPES.MemberExpression &&
            !callee.computed &&
            callee.object.type === AST_NODE_TYPES.Identifier &&
            callee.object.name === 'Number' &&
            callee.property.type === AST_NODE_TYPES.Identifier &&
            callee.property.name === 'parseFloat';

          // Match `Number(...)` called as a function (not `new Number(...)`).
          const isNumberCall =
            callee.type === AST_NODE_TYPES.Identifier &&
            callee.name === 'Number';

          if (!isGlobalParseFloat && !isNumberParseFloat && !isNumberCall)
            return;

          const args = node.arguments;

          const firstArg = args[0];

          if (firstArg === undefined) return;

          // Spread argument (`parseFloat(...rest)`) cannot be rewritten safely.
          if (firstArg.type === AST_NODE_TYPES.SpreadElement) return;

          // The argument must be purely `string` so the autofix is type-safe
          // against `Num.safeParseFloat(s: string)`. Without type information,
          // skip.
          if (services?.program == null) return;

          const checker = services.program.getTypeChecker();

          const tsNode = services.esTreeNodeToTSNodeMap?.get(firstArg);

          if (tsNode === undefined) return;

          const argType = checker.getTypeAtLocation(tsNode);

          if (!isStringType(argType)) return;

          mut_nodesToFix.push({ node, argExpression: firstArg });
        },
        'Program:exit': () => {
          const namedImports = getNamedImports(tsDataForgeImport);

          const missingImports = (['Num', 'Result'] as const).filter(
            (name) => !namedImports.includes(name),
          );

          for (const [
            index,
            { node, argExpression },
          ] of mut_nodesToFix.entries()) {
            const argText = sourceCode.getText(argExpression);

            const originalText = sourceCode.getText(node);

            context.report({
              node,
              messageId: 'useSafeParseFloat',
              data: {
                original: originalText,
                argName: argText,
              },
              fix: (fixer) => {
                const core = `Result.unwrapOkOr(Num.safeParseFloat(${argText}), Number.NaN)`;

                const importFixes =
                  index === 0 && missingImports.length > 0
                    ? buildImportFixes(
                        fixer,
                        program,
                        tsDataForgeImport,
                        missingImports,
                      )
                    : [];

                return [...importFixes, fixer.replaceText(node, core)];
              },
            });
          }
        },
      };
    },
    defaultOptions: [],
  } as const;
