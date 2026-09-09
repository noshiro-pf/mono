import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';
import {
  buildImportFixes,
  getNamedImports,
  getTsStdForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useSafeNumberParse';

/**
 * Returns `true` when every constituent of `type` is string-like, i.e. the
 * type is assignable to the `string` parameter of `SafeNumber.parse`. A union
 * such as `string | undefined` is rejected so the autofix never produces a
 * type error.
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
 * `Result.unwrapOkOr(SafeNumber.parse(x), Number.NaN)` (ts-std-forge).
 *
 * `Number(x)` is only flagged when x is purely a string type to avoid false
 * positives for `Number(someBoolean)` or `Number(someNumber)` uses.
 *
 * The ts-data-forge rule of the same shape names `Num.safeParseFloat`, which
 * has delegated to `SafeNumber.parse` since the D-49 inversion and wraps the
 * result in a `FiniteNumber` brand. This one names the implementation, for
 * callers who do not want the brand or the extra dependency.
 */
export const preferSafeNumberParse: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `parseFloat(x)`, `Number.parseFloat(x)`, or `Number(x)` (when x is a string) with `Result.unwrapOkOr(SafeNumber.parse(x), Number.NaN)` from ts-std-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useSafeNumberParse:
        'Replace `{{original}}` with `Result.unwrapOkOr(SafeNumber.parse({{argName}}), Number.NaN)` from ts-std-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsStdForgeImport = getTsStdForgeImport(program);

    const services = sourceCode.parserServices;

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
          callee.type === AST_NODE_TYPES.Identifier && callee.name === 'Number';

        if (!isGlobalParseFloat && !isNumberParseFloat && !isNumberCall) return;

        const args = node.arguments;

        const firstArg = args[0];

        if (firstArg === undefined) return;

        // Spread argument (`parseFloat(...rest)`) cannot be rewritten safely.
        if (firstArg.type === AST_NODE_TYPES.SpreadElement) return;

        // The argument must be purely `string` so the autofix is type-safe
        // against `SafeNumber.parse(value: string)`. Without type information,
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
        const namedImports = getNamedImports(tsStdForgeImport);

        const missingImports = (['Result', 'SafeNumber'] as const).filter(
          (name) => !namedImports.includes(name),
        );

        for (const [
          index,
          { node, argExpression },
        ] of mut_nodesToFix.entries()) {
          const argText = sourceCode.getText(argExpression);

          context.report({
            node,
            messageId: 'useSafeNumberParse',
            data: {
              original: sourceCode.getText(node),
              argName: argText,
            },
            fix: (fixer) => {
              const core = `Result.unwrapOkOr(SafeNumber.parse(${argText}), Number.NaN)`;

              const importFixes =
                index === 0 && missingImports.length > 0
                  ? buildImportFixes(fixer, program, missingImports)
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
