import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getArgumentText,
  getImportDeclarations,
  getNamedImports,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import * as ts from 'typescript';
import { isIdentifierNamed, typeHoldsAtEveryLayer } from './ast-utils.mjs';
import { TS_STD_FORGE_MODULE } from './constants.mjs';

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

    const tsStdForgeImports = getImportDeclarations(
      program,
      TS_STD_FORGE_MODULE,
    );

    const mut_nodesToFix: {
      node: TSESTree.CallExpression;
      argExpression: TSESTree.Expression;
    }[] = [];

    return {
      CallExpression: (node) => {
        const callee = skipTypeWrappers(node.callee);

        // Match `parseInt(...)` or `Number.parseInt(...)`.
        const isGlobalParseInt =
          callee.type === AST_NODE_TYPES.Identifier &&
          callee.name === 'parseInt';

        const isNumberParseInt =
          callee.type === AST_NODE_TYPES.MemberExpression &&
          !callee.computed &&
          isIdentifierNamed(callee.object, 'Number') &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          callee.property.name === 'parseInt';

        if (!isGlobalParseInt && !isNumberParseInt) {
          return;
        }

        const args = node.arguments;

        const firstArg = args[0];

        if (firstArg === undefined) {
          return;
        }

        // Spread argument (`parseInt(...rest)`) cannot be rewritten safely.
        if (firstArg.type === AST_NODE_TYPES.SpreadElement) {
          return;
        }

        // Only base 10: accept a missing radix or an explicit literal `10`,
        // read through its type wrappers, which leave the value as it is.
        if (args.length >= 2) {
          const radix =
            args[1] === undefined ? undefined : skipTypeWrappers(args[1]);

          if (radix?.type !== AST_NODE_TYPES.Literal || radix.value !== 10) {
            return;
          }
        }

        // The argument must be a `string` at every layer of type wrappers:
        // the value's own type is what `parseInt` sees at run time
        // (`parseInt(1e21 as unknown as string)` is 1, the rewrite 1e21), and
        // the type a wrapper states is what the fix, which keeps the wrapper,
        // hands `SafeNumber.parseInteger(value: string)`. Without type
        // information, skip.
        if (!typeHoldsAtEveryLayer(sourceCode, firstArg, isStringType)) {
          return;
        }

        mut_nodesToFix.push({ node, argExpression: firstArg });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsStdForgeImports);

        const missingImports = (['Result', 'SafeNumber'] as const).filter(
          (name) => !namedImports.includes(name),
        );

        for (const [
          index,
          { node, argExpression },
        ] of mut_nodesToFix.entries()) {
          const argText = getArgumentText(sourceCode, argExpression);

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
                  ? buildNamedImportFix(
                      fixer,
                      program,
                      TS_STD_FORGE_MODULE,
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
