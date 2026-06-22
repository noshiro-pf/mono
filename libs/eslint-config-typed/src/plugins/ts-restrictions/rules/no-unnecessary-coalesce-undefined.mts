import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'unnecessaryCoalesceUndefined';

/**
 * Deferred (non-concrete) type flags whose actual members are only known once
 * the type is instantiated. They are reduced to their base constraint before
 * checking for `null`, and treated as nullable when no constraint resolves.
 */
const DEFERRED_TYPE_FLAGS =
  ts.TypeFlags.TypeParameter |
  ts.TypeFlags.IndexedAccess |
  ts.TypeFlags.Conditional |
  ts.TypeFlags.Substitution;

/**
 * Returns `true` if the given type is the `undefined` type. Used to confirm
 * that the right-hand side of `?? undefined` is really the `undefined` value
 * and not a shadowed binding (e.g. `const undefined = 123`).
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isUndefinedType = (type: ts.Type): boolean =>
  !type.isUnion() && (type.flags & ts.TypeFlags.Undefined) !== 0;

export const noUnnecessaryCoalesceUndefined: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require the left-hand side of `?? undefined` to include `null` in its type, and remove the redundant `?? undefined` otherwise',
    },
    fixable: 'code',
    schema: [],
    messages: {
      unnecessaryCoalesceUndefined:
        '`?? undefined` is unnecessary because the left-hand side type does not include `null`. Remove it.',
    },
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const compilerOptions = parserServices.program.getCompilerOptions();

    // Without `strictNullChecks`, `null` / `undefined` are erased from the type
    // system, so the analysis below cannot tell whether the left-hand side can
    // be `null`. Removing `?? undefined` would then be unsound, so disable the
    // rule entirely (matching typescript-eslint's type-aware nullish rules).
    const strictNullChecks =
      compilerOptions.strictNullChecks ?? compilerOptions.strict ?? false;

    if (!strictNullChecks) return {};

    const checker = parserServices.program.getTypeChecker();

    /**
     * Returns `true` if the given type can be `null` (it is `null`, a union
     * containing `null`, or a permissive type such as `any` / `unknown`).
     *
     * A deferred type (type parameter, indexed access, conditional, …) is
     * reduced to its base constraint; one with no resolvable constraint is
     * treated as nullable because it could be instantiated with `null`.
     */
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    const typeIncludesNull = (type: ts.Type): boolean => {
      if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
        return true;
      }

      if (type.isUnion()) {
        return type.types.some(typeIncludesNull);
      }

      if ((type.flags & DEFERRED_TYPE_FLAGS) !== 0) {
        const constraint = checker.getBaseConstraintOfType(type);

        return constraint === undefined || typeIncludesNull(constraint);
      }

      return (type.flags & ts.TypeFlags.Null) !== 0;
    };

    return {
      LogicalExpression: (node) => {
        if (node.operator !== '??') return;

        // Only target the literal `?? undefined` syntax.
        if (
          node.right.type !== AST_NODE_TYPES.Identifier ||
          node.right.name !== 'undefined'
        ) {
          return;
        }

        // Confirm the right-hand side really is the `undefined` value and not a
        // shadowed binding (e.g. `const undefined = 123`), in which case
        // `x ?? undefined` is not equivalent to `x`.
        const rightTsNode = parserServices.esTreeNodeToTSNodeMap.get(
          node.right,
        );

        if (!isUndefinedType(checker.getTypeAtLocation(rightTsNode))) return;

        const leftTsNode = parserServices.esTreeNodeToTSNodeMap.get(node.left);

        const leftType = checker.getTypeAtLocation(leftTsNode);

        // The `?? undefined` is meaningful only when the left-hand side can be
        // `null` (it normalizes `null` to `undefined`). If `null` is not part
        // of the type, the operator is a no-op and should be removed.
        if (typeIncludesNull(leftType)) return;

        context.report({
          node,
          messageId: 'unnecessaryCoalesceUndefined',
          fix: (fixer) =>
            fixer.replaceText(node, context.sourceCode.getText(node.left)),
        });
      },
    };
  },
  defaultOptions: [],
} as const;
