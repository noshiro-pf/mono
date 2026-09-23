import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';

const MUT_PREFIX = 'mut_';

/**
 * `readonly/require-as-const` — an array or object literal that a `const`
 * binding's type is inferred from carries `as const`, unless the binding is
 * named `mut_…` (Sumi spec/readonly.md, D-60).
 *
 * ```ts
 * const point = { x: 1, y: 2 }; // reported: { x: number; y: number }
 * const point = { x: 1, y: 2 } as const; // { readonly x: 1; readonly y: 2 }
 * const mut_point = { x: 1, y: 2 }; // fine — the name says it is mutable
 * const origin: Readonly<{ x: number }> = { x: 0 }; // fine — annotated
 * ```
 *
 * `sumi/require-readonly-type` makes every *written* type readonly; this is
 * the same promise for the types that are not written. Without it an
 * unannotated literal is the one place a mutable type enters a non-`mut_`
 * binding, and the compiler accepts every write through it. With it, a write
 * to such a binding is a compiler error (TS2540 / TS2542 / TS2704), which is
 * why `mutation/no-mutation-without-mut-prefix` leaves those to the compiler.
 *
 * The literal is found through what passes its type on unchanged: `satisfies`,
 * both branches of a conditional, and both operands of `??`. An assertion to
 * any other type (`[] as readonly number[]`) states the type itself and is
 * left alone, as is a literal nested in a call, a function body or another
 * literal — a parameter and a return type are annotated, and `as const`
 * reaches the whole literal it is on.
 *
 * Out of scope, deliberately:
 *
 * - **An annotated binding.** The annotation is the type, and
 *   `sumi/require-readonly-type` already checks it. `as const` there is
 *   neither required nor refused: readonly spellings are not normalized
 *   (D-45).
 * - **A primitive or template literal.** Its inferred type has nothing to
 *   mutate; `append-as-const` adds `as const` to those for literal types, which
 *   is a different question.
 * - **A destructuring `const`** (`const { a } = { a: [1] }`). The literal is
 *   never bound, and `as const` would not say which of the names is meant to
 *   be mutable. Destructuring a literal on the spot does not occur in this
 *   repository.
 * - **`let`**, which `mutation/no-let-without-mut-prefix` allows only for
 *   `mut_` names in the first place.
 */
export const requireAsConst = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require `as const` on an array or object literal a non-`mut_` `const` binding infers its type from (Sumi D-60).',
    },
    messages: {
      missingAsConst:
        '`{{name}}` infers a mutable type from this literal. Write `as const` so it is readonly, or name the binding `mut_{{name}}` if it is meant to be mutated (D-60).',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    VariableDeclaration: (node) => {
      if (node.kind !== 'const') return;

      for (const declarator of node.declarations) {
        const { id, init } = declarator;

        if (id.type !== AST_NODE_TYPES.Identifier) continue;

        // oxlint gives `null` for an absent annotation where the typings say
        // `undefined`; declared `unknown` so that the check keeps both halves.
        const annotation: unknown = id.typeAnnotation;

        if (
          init === null ||
          id.name.startsWith(MUT_PREFIX) ||
          (annotation !== null && annotation !== undefined)
        ) {
          continue;
        }

        for (const literal of inferredLiterals(init)) {
          context.report({
            loc: literal.loc,
            messageId: 'missingAsConst',
            data: { name: id.name },
          });
        }
      }
    },
  }),
});

/**
 * The literals whose type becomes the binding's type: the expression itself,
 * or what `satisfies`, a conditional and `??` pass through. Every other
 * expression — `as const` and any other assertion included — decides the type
 * itself, and contributes nothing.
 */
const inferredLiterals = (
  expression: DeepReadonly<TSESTree.Expression>,
): readonly DeepReadonly<
  TSESTree.ArrayExpression | TSESTree.ObjectExpression
>[] => {
  if (
    expression.type === AST_NODE_TYPES.ArrayExpression ||
    expression.type === AST_NODE_TYPES.ObjectExpression
  ) {
    return [expression];
  }

  if (expression.type === AST_NODE_TYPES.TSSatisfiesExpression) {
    return inferredLiterals(expression.expression);
  }

  if (expression.type === AST_NODE_TYPES.ConditionalExpression) {
    return [
      ...inferredLiterals(expression.consequent),
      ...inferredLiterals(expression.alternate),
    ];
  }

  if (
    expression.type === AST_NODE_TYPES.LogicalExpression &&
    expression.operator === '??'
  ) {
    return [
      ...inferredLiterals(expression.left),
      ...inferredLiterals(expression.right),
    ];
  }

  return [];
};
