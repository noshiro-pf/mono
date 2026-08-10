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

type MessageIds = 'useSafeParseInt';

/**
 * Returns `true` when every constituent of `type` is string-like, i.e. the type
 * is assignable to the `string` parameter of `Num.safeParseInt`. A union such
 * as `string | undefined` is rejected so the autofix never produces a type
 * error.
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
 * Detects the base-10 forms of `parseInt` / `Number.parseInt` (`parseInt(x)` or
 * `parseInt(x, 10)`) and replaces them with
 * `Result.unwrapOkOr(Num.safeParseInt(x), Number.NaN)` (ts-data-forge).
 *
 * Other radixes (e.g. `parseInt(x, 16)`) are intentionally left untouched, as
 * `Num.safeParseInt` only supports base 10.
 */
export const preferNumSafeParseInt: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `parseInt(x, 10)` with `Result.unwrapOkOr(Num.safeParseInt(x), Number.NaN)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useSafeParseInt:
        'Replace `{{original}}` with `Result.unwrapOkOr(Num.safeParseInt({{argName}}), Number.NaN)` from ts-data-forge.',
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

        // Match `parseInt(...)` or `Number.parseInt(...)`.
        const isGlobalParseInt =
          callee.type === AST_NODE_TYPES.Identifier &&
          callee.name === 'parseInt';

        const isNumberParseInt =
          callee.type === AST_NODE_TYPES.MemberExpression &&
          !callee.computed &&
          callee.object.type === AST_NODE_TYPES.Identifier &&
          callee.object.name === 'Number' &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          callee.property.name === 'parseInt';

        if (!isGlobalParseInt && !isNumberParseInt) return;

        const args = node.arguments;

        const firstArg = args[0];

        if (firstArg === undefined) return;

        // Spread argument (`parseInt(...rest)`) cannot be rewritten safely.
        if (firstArg.type === AST_NODE_TYPES.SpreadElement) return;

        // Only base 10: accept a missing radix or an explicit literal `10`.
        if (args.length >= 2) {
          const radix = args[1];

          if (radix?.type !== AST_NODE_TYPES.Literal || radix.value !== 10) {
            return;
          }
        }

        // The argument must be a `string` so the autofix is type-safe against
        // `Num.safeParseInt(s: string)`. Without type information, skip.
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
            messageId: 'useSafeParseInt',
            data: {
              original: originalText,
              argName: argText,
            },
            fix: (fixer) => {
              const core = `Result.unwrapOkOr(Num.safeParseInt(${argText}), Number.NaN)`;

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
