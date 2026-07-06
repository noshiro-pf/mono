import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import * as ts from 'typescript';

/**
 * Deferred (non-concrete) type flags whose actual members are only known once
 * the type is instantiated. They are reduced to their base constraint before
 * checking whether they are an array.
 */
const DEFERRED_TYPE_FLAGS =
  ts.TypeFlags.TypeParameter |
  ts.TypeFlags.IndexedAccess |
  ts.TypeFlags.Conditional |
  ts.TypeFlags.Substitution;

/**
 * Builds a predicate that returns `true` if every constituent of the given type
 * is an array or tuple type. Unions must be array-like in all branches for a
 * defensive `Array.from()` to be safely removable; `any` / `unknown` are
 * treated conservatively as not array-like because they could be a `Set` /
 * `Map` / iterable that genuinely relies on `Array.from()` to be materialized
 * into an array.
 */
export const createIsArrayOrTupleType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
): ((type: ts.Type) => boolean) => {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  const isArrayOrTupleType = (type: ts.Type): boolean => {
    if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0) {
      return false;
    }

    if (type.isUnion()) {
      return type.types.every(isArrayOrTupleType);
    }

    if ((type.flags & DEFERRED_TYPE_FLAGS) !== 0) {
      const constraint = checker.getBaseConstraintOfType(type);

      return constraint !== undefined && isArrayOrTupleType(constraint);
    }

    return checker.isArrayType(type) || checker.isTupleType(type);
  };

  return isArrayOrTupleType;
};

/**
 * Argument expression kinds that can be used directly as the object of a member
 * expression without additional parentheses. Anything else (a conditional,
 * binary/logical expression, etc.) is wrapped in parentheses when inlined so the
 * resulting `<arg>.toSorted()` keeps its original precedence.
 */
const PARENTHESES_FREE_OBJECT_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.CallExpression,
  AST_NODE_TYPES.ThisExpression,
  AST_NODE_TYPES.ArrayExpression,
]);

/**
 * Wraps the source text of an expression in parentheses when it cannot be used
 * directly as the object of a member expression.
 */
export const toMemberObjectText = (
  argText: string,
  argNodeType: AST_NODE_TYPES,
): string =>
  PARENTHESES_FREE_OBJECT_TYPES.has(argNodeType)
    ? argText
    : (`(${argText})` as const);

/**
 * Matches a call expression of the shape `Array.from(<arg>)` (exactly one
 * non-spread argument) and returns the argument, or `undefined` when the node
 * has a different shape. `Array.from(x, mapFn)` maps each element, so it is not
 * a plain defensive copy and is not matched.
 */
export const matchArrayFromCall = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): TSESTree.Expression | undefined => {
  if (node.type !== AST_NODE_TYPES.CallExpression) return undefined;

  const callee = node.callee;

  if (
    callee.type !== AST_NODE_TYPES.MemberExpression ||
    callee.computed ||
    callee.object.type !== AST_NODE_TYPES.Identifier ||
    callee.object.name !== 'Array' ||
    callee.property.type !== AST_NODE_TYPES.Identifier ||
    callee.property.name !== 'from'
  ) {
    return undefined;
  }

  if (node.arguments.length !== 1) return undefined;

  const arg = node.arguments[0];

  if (arg === undefined || arg.type === AST_NODE_TYPES.SpreadElement) {
    return undefined;
  }

  return arg;
};
