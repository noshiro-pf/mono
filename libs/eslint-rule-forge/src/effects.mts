import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether evaluating `node` may do something a reordering or a deletion could
 * observe — the question a fix that moves or drops an expression asks.
 *
 * It is `ASTUtils.hasSideEffect` (a call, an assignment, an update, `delete`,
 * `await`, `yield`, …) plus what that leaves out:
 *
 * - a tagged template, which calls its tag (`` html`<p/>` ``);
 * - a spread into an array or into arguments (`[...it]`), which runs the
 *   iterator — an object spread (`{ ...o }`) copies own properties and runs
 *   none.
 *
 * Like `hasSideEffect`, it does not look into a function's body, which nothing
 * runs when the function is evaluated: `() => html`<p/>`` has no effect.
 * Getters and implicit conversions (`a.b`, `a + b`) are not counted, as
 * `hasSideEffect` does not count them by default.
 */
export const mayHaveEffect = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): boolean =>
  ASTUtils.hasSideEffect(node, sourceCode) ||
  hasEffectHasSideEffectMisses(node, sourceCode.visitorKeys);

const isNode = (value: unknown): value is TSESTree.Node =>
  typeof value === 'object' && value !== null && Reflect.has(value, 'type');

const isFunction = (node: TSESTree.Node): boolean =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration;

const hasEffectHasSideEffectMisses = (
  value: unknown,
  visitorKeys: TSESLint.SourceCode.VisitorKeys,
): boolean => {
  if (Array.isArray(value)) {
    return value.some((element: unknown) =>
      hasEffectHasSideEffectMisses(element, visitorKeys),
    );
  }

  if (!isNode(value) || isFunction(value)) {
    return false;
  }

  if (
    value.type === AST_NODE_TYPES.TaggedTemplateExpression ||
    (value.type === AST_NODE_TYPES.SpreadElement &&
      value.parent.type !== AST_NODE_TYPES.ObjectExpression)
  ) {
    return true;
  }

  return (visitorKeys[value.type] ?? []).some((key) => {
    const child: unknown = Reflect.get(value, key);

    return hasEffectHasSideEffectMisses(child, visitorKeys);
  });
};
