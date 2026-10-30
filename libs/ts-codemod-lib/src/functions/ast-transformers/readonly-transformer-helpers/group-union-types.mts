import * as tsm from 'ts-morph';
import {
  hasCallOrConstructSignature,
  isAtomicTypeNode,
  isReadonlyTupleOrArrayTypeNode,
  isReadonlyTypeReferenceNode,
  removeParentheses,
  type AtomicTypeNode,
  type ReadonlyArrayTypeNode,
  type ReadonlyTupleTypeNode,
  type ReadonlyTypeReferenceNode,
} from '../../functions/index.mjs';

/**
 * Sorts the members of a union or intersection into the groups
 * `convert-to-readonly` writes back separately.
 *
 * `typeLiterals` is the group joined and wrapped in a single `Readonly<...>`.
 * It takes type literals, the `Readonly<...>` members that may be merged (see
 * `isMergeableReadonlyTypeReferenceNode`), and, when the union or intersection
 * is itself the argument of a `Readonly<...>` (`underReadonly`), every other
 * member that `Readonly` still means something to (see `staysOutsideReadonly`):
 * taking such a member out of the `Readonly` it was written under would drop
 * its readonly-ness.
 *
 * `keptUnwrapped` names the further type literals the caller leaves unwrapped
 * (one with a property of an ignored prefix, such as `mut_`), which stay out of
 * that group as one with a call or construct signature does — except under a
 * `Readonly` intersection with a member that may be an array.
 */
export const groupUnionIntersectionTypes = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  types: readonly tsm.TypeNode[],
  {
    operator,
    underReadonly,
    deepReadonlyTypeName,
    keptUnwrapped = () => false,
  }: Readonly<{
    operator: '&' | '|';
    underReadonly: boolean;
    deepReadonlyTypeName: string;
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    keptUnwrapped?: (node: tsm.TypeLiteralNode) => boolean;
  }>,
): Readonly<{
  primitives:
    | Readonly<{
        firstPosition: number;
        nodes: readonly AtomicTypeNode[];
      }>
    | undefined;

  arraysAndTuples:
    | Readonly<{
        firstPosition: number;
        nodes: readonly (
          | tsm.ArrayTypeNode
          | tsm.TupleTypeNode
          | ReadonlyArrayTypeNode
          | ReadonlyTupleTypeNode
        )[];
      }>
    | undefined;

  typeLiterals:
    | Readonly<{
        firstPosition: number;
        nodes: readonly tsm.TypeNode[];
      }>
    | undefined;

  others:
    | Readonly<{
        firstPosition: number;
        nodes: readonly tsm.TypeNode[];
      }>
    | undefined;
}> => {
  const mut_grouped: {
    primitives:
      | Readonly<{
          firstPosition: number;
          nodes: AtomicTypeNode[];
        }>
      | undefined;

    arraysAndTuples:
      | Readonly<{
          firstPosition: number;
          nodes: (
            | tsm.ArrayTypeNode
            | tsm.TupleTypeNode
            | ReadonlyArrayTypeNode
            | ReadonlyTupleTypeNode
          )[];
        }>
      | undefined;

    typeLiterals:
      | Readonly<{
          firstPosition: number;
          nodes: tsm.TypeNode[];
        }>
      | undefined;

    others:
      | Readonly<{
          firstPosition: number;
          nodes: tsm.TypeNode[];
        }>
      | undefined;
  } = {
    primitives: undefined,
    arraysAndTuples: undefined,
    typeLiterals: undefined,
    others: undefined,
  };

  // Taking a literal out of `Readonly<A & { mut_x: X }>` leaves
  // `Readonly<A> & { mut_x: X }`, which is another type when `A` may be an
  // array (see `isMergeableReadonlyTypeReferenceNode`). So `keptUnwrapped` is
  // honoured under `Readonly<... & ...>` only when every member that stays
  // under it is an object type.
  const honoursKeptUnwrapped =
    !underReadonly ||
    operator === '|' ||
    types.every((t_) => {
      const t = removeParentheses(t_);

      return (
        isAtomicTypeNode(t) ||
        t.isKind(tsm.SyntaxKind.ArrayType) ||
        t.isKind(tsm.SyntaxKind.TupleType) ||
        isReadonlyTupleOrArrayTypeNode(t) ||
        t.isKind(tsm.SyntaxKind.TypeLiteral) ||
        isMergeableReadonlyTypeReferenceNode(t, operator) ||
        staysOutsideReadonly(t, deepReadonlyTypeName)
      );
    });

  for (const [i, t_] of types.entries()) {
    const t = removeParentheses(t_);

    // isReadonlyTypeReferenceNode
    if (isAtomicTypeNode(t)) {
      if (mut_grouped.primitives === undefined) {
        mut_grouped.primitives = {
          firstPosition: i,
          nodes: [t],
        } as const;
      } else {
        mut_grouped.primitives.nodes.push(t);
      }

      continue;
    }

    if (
      t.isKind(tsm.SyntaxKind.ArrayType) ||
      t.isKind(tsm.SyntaxKind.TupleType) ||
      isReadonlyTupleOrArrayTypeNode(t)
    ) {
      if (mut_grouped.arraysAndTuples === undefined) {
        mut_grouped.arraysAndTuples = {
          firstPosition: i,
          nodes: [t],
        } as const;
      } else {
        mut_grouped.arraysAndTuples.nodes.push(t);
      }

      continue;
    }

    // A type literal that declares a call or construct signature, or one the
    // caller keeps unwrapped, is deliberately not grouped here: this group is
    // joined and wrapped in a single `Readonly<...>`, which such a literal does
    // not survive. It falls through to `others`, which leaves it as written. See
    // `hasCallOrConstructSignature`.
    if (
      (t.isKind(tsm.SyntaxKind.TypeLiteral) &&
        !hasCallOrConstructSignature(t) &&
        !(honoursKeptUnwrapped && keptUnwrapped(t))) ||
      isMergeableReadonlyTypeReferenceNode(t, operator) ||
      (underReadonly && !staysOutsideReadonly(t, deepReadonlyTypeName))
    ) {
      if (mut_grouped.typeLiterals === undefined) {
        mut_grouped.typeLiterals = {
          firstPosition: i,
          nodes: [t],
        } as const;
      } else {
        mut_grouped.typeLiterals.nodes.push(t);
      }

      continue;
    }

    // intersections, unions, etc.
    if (mut_grouped.others === undefined) {
      mut_grouped.others = {
        firstPosition: i,
        nodes: [t],
      } as const;
    } else {
      mut_grouped.others.nodes.push(t);
    }
  }

  return mut_grouped;
};

/**
 * Whether a `Readonly<T>` member of a union or intersection may be merged with
 * the others into one `Readonly<...>`.
 *
 * - In a union, any `T`: `Readonly` distributes over `|`, so `Readonly<A> |
 *   Readonly<B>` and `Readonly<A | B>` are the same type.
 * - In an intersection, only a `T` known to be an object type (see
 *   `isObjectTypeLiteral`). Over object types `Readonly<A> & Readonly<B>` and
 *   `Readonly<A & B>` agree, but `Readonly` maps an array to a readonly array
 *   only when its argument _is_ an array, so `Readonly<string[] & X>` leaves the
 *   array mutable where `Readonly<string[]> & Readonly<X>` does not. A type
 *   parameter or an alias may be such an array.
 */
export const isMergeableReadonlyTypeReferenceNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeNode,
  operator: '&' | '|',
): node is ReadonlyTypeReferenceNode =>
  isReadonlyTypeReferenceNode(node) &&
  (operator === '|' || isObjectTypeLiteral(node.getTypeArguments()[0]));

/**
 * A type literal or a mapped type known to be an object type, or a union,
 * intersection or `Readonly<...>` of them.
 */
const isObjectTypeLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeNode,
): boolean => {
  const t = removeParentheses(node);

  if (t.isKind(tsm.SyntaxKind.TypeLiteral)) {
    return true;
  }

  // A mapped type is an object type unless it maps over `keyof T`, which maps
  // an array `T` to an array.
  if (t.isKind(tsm.SyntaxKind.MappedType)) {
    const constraint = t.getTypeParameter().getConstraint();

    return !(
      constraint?.isKind(tsm.SyntaxKind.TypeOperator) === true &&
      constraint.getOperator() === tsm.SyntaxKind.KeyOfKeyword
    );
  }

  if (isReadonlyTypeReferenceNode(t)) {
    return isObjectTypeLiteral(t.getTypeArguments()[0]);
  }

  if (
    t.isKind(tsm.SyntaxKind.UnionType) ||
    t.isKind(tsm.SyntaxKind.IntersectionType)
  ) {
    return t.getTypeNodes().every(isObjectTypeLiteral);
  }

  return false;
};

/**
 * Whether a member of a union or intersection under `Readonly<...>` may be
 * taken out of it as it is.
 *
 * - A function or constructor type, or a type literal with a call or construct
 *   signature, loses its signatures under `Readonly`; see
 *   `hasCallOrConstructSignature`.
 * - `keyof T` and `unique symbol` are not object types.
 * - `DeepReadonly<T>`, `ReadonlyMap`, `ReadonlySet` and `ReadonlyRecord` are
 *   readonly already.
 */
const staysOutsideReadonly = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.TypeNode,
  deepReadonlyTypeName: string,
): boolean => {
  if (
    node.isKind(tsm.SyntaxKind.FunctionType) ||
    node.isKind(tsm.SyntaxKind.ConstructorType) ||
    node.isKind(tsm.SyntaxKind.TypeLiteral) ||
    node.isKind(tsm.SyntaxKind.TypeOperator)
  ) {
    return true;
  }

  if (node.isKind(tsm.SyntaxKind.TypeReference)) {
    const typeName = node.getTypeName().getText();

    return (
      typeName === deepReadonlyTypeName ||
      typeName === 'ReadonlyMap' ||
      typeName === 'ReadonlySet' ||
      typeName === 'ReadonlyRecord'
    );
  }

  return false;
};
