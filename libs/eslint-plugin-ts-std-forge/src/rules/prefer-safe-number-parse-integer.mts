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

type MessageIds = 'useSafeNumberParseInteger';

/**
 * Returns `true` when every constituent of `type` is string-like, i.e. the
 * type is assignable to the `string` parameter of `SafeNumber.parseInteger`.
 * A union such as `string | undefined` is rejected so the autofix never
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
 * Detects `parseInt(x)` / `Number.parseInt(x, 10)` and replaces them with
 * `Result.unwrapOkOr(SafeNumber.parseInteger(x), Number.NaN)` (ts-std-forge).
 *
 * Only base 10 is rewritten: `SafeNumber.parseInteger` takes no radix, so a
 * call that passes another one means something the replacement cannot say.
 */
export const preferSafeNumberParseInteger: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `parseInt(x)` or `Number.parseInt(x, 10)` with `Result.unwrapOkOr(SafeNumber.parseInteger(x), Number.NaN)` from ts-std-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useSafeNumberParseInteger:
        'Replace `{{original}}` with `Result.unwrapOkOr(SafeNumber.parseInteger({{argName}}), Number.NaN)` from ts-std-forge.',
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
        // `SafeNumber.parseInteger(value: string)`. Without type information,
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
            messageId: 'useSafeNumberParseInteger',
            data: {
              original: sourceCode.getText(node),
              argName: argText,
            },
            fix: (fixer) => {
              const core = `Result.unwrapOkOr(SafeNumber.parseInteger(${argText}), Number.NaN)`;

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
