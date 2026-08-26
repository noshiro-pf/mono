import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr, hasKey, isNonNullObject, isRecord } from 'ts-data-forge';

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

  if (
    others.some(
      (element) =>
        normalizeWhitespace(sourceCode.getText(element)) !== expected,
    )
  ) {
    return undefined;
  }

  return definesRecursiveTypeAlias(tuple, sourceCode)
    ? undefined
    : {
        node: isReadonly ? parent : tuple,
        isReadonly,
        elementText,
        fixedCount: leading.length,
        hasRest,
      };
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
 * **Any cycle counts, which leaves some rewritable tuples alone.** Not every
 * cycle actually breaks: TypeScript resolves an object type, an array, a tuple
 * and a function type without resolving what is inside them, so `type Pair =
 * FixedLengthTuple<2, Foo>` alongside `type Foo = { p: Pair }` compiles, and so
 * does `type Tree = { kids: FixedLengthTuple<2, Tree> }`. Skipping those
 * constructs while following references was tried and does not hold up — the
 * deferral is undone by anything that asks for the structure, and that can sit
 * anywhere in the file:
 *
 * ```ts
 * type Pair = readonly [Foo, Foo]; // rewriting this breaks Pair and Foo
 * type Foo = Wrapper[number]; // …because of the indexed access here
 * type Wrapper = readonly Pair[];
 * ```
 *
 * Deciding it properly means knowing every use of every alias, which no
 * syntactic rule can do — so a cycle of any shape suppresses the rewrite. The
 * cost is a tuple left spelled out; the alternative is an autofix that turns a
 * type into `any`.
 *
 * A cycle closed through an `import` is not visible here and is not detected.
 */
const definesRecursiveTypeAlias = (
  tuple: TSESTree.TSTupleType,
  sourceCode: TSESLint.SourceCode,
): boolean => {
  const alias = enclosingTypeAlias(tuple);

  if (alias === undefined) return false;

  const references = aliasReferenceGraph(programOf(alias), sourceCode);

  const mut_seen = new Set<string>();

  const mut_queue: string[] = tuple.elementTypes.flatMap((element) =>
    Array.from(referencedTypeNames(element, sourceCode)),
  );

  while (true) {
    const next = mut_queue.pop();

    if (next === undefined) return false;

    if (next === alias.id.name) return true;

    if (mut_seen.has(next)) continue;

    mut_seen.add(next);

    const referenced = references.get(next);

    if (referenced !== undefined) {
      mut_queue.push(...referenced);
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

/**
 * Which other type names each `type X = …` in the file refers to, keyed by `X`.
 *
 * Built once per file and cached on the `Program` node: the search below runs
 * per candidate tuple, and rebuilding this for each of them made the rule cost
 * `O(tuples × file size)` — a full second on the largest generated files here.
 */
const aliasReferenceGraph = (
  program: TSESTree.Program,
  sourceCode: TSESLint.SourceCode,
): ReadonlyMap<string, ReadonlySet<string>> => {
  const cached = aliasReferenceGraphCache.get(program);

  if (cached !== undefined) return cached;

  const mut_graph = new Map<string, ReadonlySet<string>>();

  walk(program, sourceCode, (visited) => {
    if (visited.type === AST_NODE_TYPES.TSTypeAliasDeclaration) {
      mut_graph.set(
        visited.id.name,
        referencedTypeNames(visited.typeAnnotation, sourceCode),
      );
    }
  });

  aliasReferenceGraphCache.set(program, mut_graph);

  return mut_graph;
};

const aliasReferenceGraphCache = new WeakMap<
  TSESTree.Program,
  ReadonlyMap<string, ReadonlySet<string>>
>();

const programOf = (node: TSESTree.Node): TSESTree.Program =>
  node.type === AST_NODE_TYPES.Program ? node : programOf(node.parent);

/** The names every `X` / `X<…>` reference in the subtree points at. */
const referencedTypeNames = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): ReadonlySet<string> => {
  const mut_names = new Set<string>();

  walk(node, sourceCode, (visited) => {
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
 * Children are found through the parser's visitor keys, so only the properties
 * that actually hold one are read. Reading every own property instead works
 * too, and is the fallback for a parser that declares no keys for a node type,
 * but it allocates an entry pair per property and walks `loc` / `range` as
 * well — on the generated rule-type files that alone was most of the cost.
 */
const walk = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
  visit: (visited: TSESTree.Node) => void,
): void => {
  visit(node);

  if (!isRecord(node)) return;

  const keys =
    sourceCode.visitorKeys[node.type] ??
    Object.keys(node).filter((key) => key !== 'parent');

  for (const key of keys) {
    const value: unknown = hasKey(node, key) ? node[key] : undefined;

    if (Arr.isArray(value)) {
      for (const element of value) {
        if (isNode(element)) walk(element, sourceCode, visit);
      }
    } else if (isNode(value)) {
      walk(value, sourceCode, visit);
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
