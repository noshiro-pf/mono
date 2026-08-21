import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr, isNonNullObject } from 'ts-data-forge';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export type UniformTupleShape = Readonly<{
  /** The node an autofix must replace: the tuple, or the `readonly` operator. */
  node: TSESTree.Node;
  isReadonly: boolean;
  /** Source text of the (single, shared) element type. */
  elementText: string;
  /** Number of leading fixed-position elements. */
  fixedCount: number;
  /** Whether a trailing `...V[]` rest element is present. */
  hasRest: boolean;
}>;

/**
 * Recognizes a tuple whose every position has the *same* element type — the
 * hand-rolled spelling of ts-type-forge's length-constrained tuple family:
 *
 * | shape                | meaning                    |
 * | :------------------- | :------------------------- |
 * | `[V, ..., V]`        | `FixedLengthTuple<N, V>`   |
 * | `[V, ..., V, ...V[]]`| `MinLengthTuple<N, V>`     |
 *
 * Returns `undefined` for anything else. Deliberately narrow:
 *
 * - Element types are compared by normalized source text, so heterogeneous
 *   tuples are never matched.
 * - Optional (`[V?]`) and labelled (`[head: V]`) members are skipped, since
 *   rewriting them would drop information.
 * - A tuple that is only a rest element (`[...V[]]`) is not a length
 *   constraint at all.
 * - A tuple inside the `extends` clause of a conditional type is a match
 *   pattern, not a type (see {@link isInConditionalTypeExtendsClause}).
 */
export const analyzeUniformTuple = (
  tuple: TSESTree.TSTupleType,
  sourceCode: TSESLint.SourceCode,
): UniformTupleShape | undefined => {
  if (isInConditionalTypeExtendsClause(tuple)) return undefined;

  if (definesRecursiveTypeAlias(tuple)) return undefined;

  const { parent } = tuple;

  const isReadonly =
    parent.type === AST_NODE_TYPES.TSTypeOperator &&
    parent.operator === 'readonly';

  const elements = tuple.elementTypes;

  const last = elements.at(-1);

  const hasRest = last?.type === AST_NODE_TYPES.TSRestType;

  const leading = hasRest ? Arr.butLast(elements) : elements;

  if (
    Arr.isEmpty(leading) ||
    leading.some(
      (element) =>
        element.type === AST_NODE_TYPES.TSRestType ||
        element.type === AST_NODE_TYPES.TSOptionalType ||
        element.type === AST_NODE_TYPES.TSNamedTupleMember,
    )
  ) {
    return undefined;
  }

  const restElementType =
    last !== undefined && hasRest
      ? getArrayElementType(last.typeAnnotation)
      : undefined;

  if (hasRest && restElementType === undefined) return undefined;

  const [head] = leading;

  if (head === undefined) return undefined;

  const elementText = sourceCode.getText(head);

  const expected = normalizeWhitespace(elementText);

  const others = [
    ...Arr.tail(leading),
    ...(restElementType === undefined ? [] : [restElementType]),
  ];

  return others.every(
    (element) => normalizeWhitespace(sourceCode.getText(element)) === expected,
  )
    ? {
        node: isReadonly ? parent : tuple,
        isReadonly,
        elementText,
        fixedCount: leading.length,
        hasRest,
      }
    : undefined;
};

/**
 * Whether `node` sits inside the `extends` clause of a conditional type, where
 * a tuple is a *match pattern* rather than a type.
 *
 * `[A, B] extends [true, true]` matches element-wise even while `A` and `B` are
 * still generic. The canonical spellings resolve through a mapped type
 * (`MutableFixedLengthTuple<N, V>` is `Mutable<FixedLengthTuple<N, V>>`), and
 * against one of those the checker defers the whole conditional instead —
 * yielding `boolean` where the tuple pattern yielded `true` or `false`, which
 * silently widens everything downstream. So those positions are left alone.
 */
const isInConditionalTypeExtendsClause = (node: TSESTree.Node): boolean => {
  // The root has no parent, so it terminates the walk.
  if (node.type === AST_NODE_TYPES.Program) return false;

  const { parent } = node;

  return (
    (parent.type === AST_NODE_TYPES.TSConditionalType &&
      parent.extendsType === node) ||
    isInConditionalTypeExtendsClause(parent)
  );
};

/**
 * Whether the tuple spells out an alias that its own element type leads back
 * to.
 *
 * A tuple literal is how TypeScript's cycle-breaking works: `type T = readonly
 * [T, T]` resolves, because the element positions are deferred. Rewriting it to
 * `FixedLengthTuple<2, T>` routes the same cycle through a mapped type, which
 * the checker will not compute — `T` becomes an error type, and every use of it
 * silently reads as `any`. `tsc` reports the alias once; the typed linter then
 * reports each use, which is how this was found.
 *
 * The cycle is often indirect. `LambdaApplication = readonly [LambdaTerm,
 * LambdaTerm]` looks fine on its own, and only recurses because `LambdaTerm` is
 * a union that includes `LambdaApplication`. So this follows references through
 * the other aliases in the file rather than looking for the enclosing name in
 * the element text.
 *
 * A cycle closed through an `import` is not visible here and is not detected.
 */
const definesRecursiveTypeAlias = (tuple: TSESTree.TSTupleType): boolean => {
  const alias = enclosingTypeAlias(tuple);

  if (alias === undefined) return false;

  const aliasesInFile = new Map<string, TSESTree.TSTypeAliasDeclaration>(
    collectTypeAliases(alias).map((a) => [a.id.name, a]),
  );

  const mut_seen = new Set<string>();

  const mut_queue: string[] = tuple.elementTypes.flatMap((element) =>
    Array.from(referencedTypeNames(element)),
  );

  while (true) {
    const next = mut_queue.pop();

    if (next === undefined) return false;

    if (next === alias.id.name) return true;

    if (mut_seen.has(next)) continue;

    mut_seen.add(next);

    const referenced = aliasesInFile.get(next);

    if (referenced !== undefined) {
      mut_queue.push(...referencedTypeNames(referenced.typeAnnotation));
    }
  }
};

/** The `type X = …` declaration `node` sits in, if any. */
const enclosingTypeAlias = (
  node: TSESTree.Node,
): TSESTree.TSTypeAliasDeclaration | undefined => {
  if (node.type === AST_NODE_TYPES.TSTypeAliasDeclaration) return node;

  if (node.type === AST_NODE_TYPES.Program) return undefined;

  return enclosingTypeAlias(node.parent);
};

/** Every `type X = …` declaration in the file `node` belongs to. */
const collectTypeAliases = (
  node: TSESTree.Node,
): readonly TSESTree.TSTypeAliasDeclaration[] => {
  const mut_found: TSESTree.TSTypeAliasDeclaration[] = [];

  walk(programOf(node), (visited) => {
    if (visited.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
      mut_found.push(visited);
    }
  });

  return mut_found;
};

const programOf = (node: TSESTree.Node): TSESTree.Node =>
  node.type === AST_NODE_TYPES.Program ? node : programOf(node.parent);

/** The names every `X` / `X<…>` reference in the subtree points at. */
const referencedTypeNames = (node: TSESTree.Node): ReadonlySet<string> => {
  const mut_names = new Set<string>();

  walk(node, (visited) => {
    if (
      visited.type === AST_NODE_TYPES.TSTypeReference &&
      visited.typeName.type === AST_NODE_TYPES.Identifier
    ) {
      mut_names.add(visited.typeName.name);
    }
  });

  return mut_names;
};

/**
 * Visits `node` and its descendants.
 *
 * Children are found by inspecting the node's own properties, so this needs no
 * table of visitor keys. `parent` is skipped — following it would walk back up
 * and never terminate.
 */
const walk = (
  node: TSESTree.Node,
  visit: (visited: TSESTree.Node) => void,
): void => {
  visit(node);

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') continue;

    if (Arr.isArray(value)) {
      for (const element of value) {
        if (isNode(element)) walk(element, visit);
      }
    } else if (isNode(value)) {
      walk(value, visit);
    }
  }
};

const isNode = (value: unknown): value is TSESTree.Node =>
  isNonNullObject(value) &&
  typeof (value as Readonly<{ type?: unknown }>).type === 'string';

/** Unwraps `V[]` and `readonly V[]` to `V`. */
const getArrayElementType = (
  node: TSESTree.TypeNode,
): TSESTree.TypeNode | undefined => {
  if (node.type === AST_NODE_TYPES.TSArrayType) return node.elementType;

  return node.type === AST_NODE_TYPES.TSTypeOperator &&
    node.operator === 'readonly' &&
    node.typeAnnotation?.type === AST_NODE_TYPES.TSArrayType
    ? node.typeAnnotation.elementType
    : undefined;
};

const normalizeWhitespace = (text: string): string =>
  text.replaceAll(/\s+/gu, ' ').trim();
