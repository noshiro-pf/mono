import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';

const MUT_PREFIX = 'mut_';

/** References that make everything beneath them readonly. */
const deepReadonlyNames: ReadonlySet<string> = new Set(['DeepReadonly']);

/** References whose direct type argument is readonly (shallowly). */
const shallowReadonlyNames: ReadonlySet<string> = new Set(['Readonly']);

/** References that declare mutability on purpose; nothing beneath is checked. */
const mutableNames: ReadonlySet<string> = new Set(['Mutable', 'MutableRecord']);

/** Mutable standard-library references and what to write instead. */
const mutableReferences: ReadonlyMap<string, string> = new Map([
  ['Array', '`readonly T[]` (or `ReadonlyArray<T>`)'],
  ['Map', '`ReadonlyMap<K, V>`'],
  ['Set', '`ReadonlySet<T>`'],
  ['Record', '`ReadonlyRecord<K, V>` (or `Readonly<Record<K, V>>`)'],
]);

type MessageIds =
  | 'array'
  | 'tuple'
  | 'property'
  | 'indexSignature'
  | 'mappedType'
  | 'reference';

/**
 * `readonly/require-readonly-type` — every type annotation is written
 * readonly (spec/readonly.md): arrays and tuples carry `readonly`, object
 * type members carry `readonly` (or the literal sits in `Readonly<>` /
 * `DeepReadonly<>`), mapped types keep `readonly`, and the mutable
 * standard-library references (`Array` / `Map` / `Set` / `Record`) are
 * replaced by their readonly counterparts.
 *
 * The decisions are a check-only fork of ts-codemod-lib's
 * `convert-to-readonly` (D-45): the same nodes and the same exclusions —
 * `mut_`-prefixed parameters, variables, type aliases and properties;
 * anything under `DeepReadonly<>` or `Mutable<>`; the direct argument of
 * `Readonly<>`. Unlike the codemod it accepts every readonly spelling and
 * normalizes nothing. Parameters are the one place the codemod's `mut_`
 * exemption is not mirrored: a parameter is readonly whatever its name
 * (spec/readonly.md), as the type-aware parameter rule also insists.
 */
export const requireReadonlyType = createRule<readonly [], MessageIds>({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require readonly type annotations everywhere (Sumi spec/readonly.md, D-45).',
    },
    messages: {
      array:
        'Array types are written `readonly T[]` in Sumi (readonly-by-default; D-3).',
      tuple:
        'Tuple types are written `readonly [A, B]` in Sumi (readonly-by-default; D-3).',
      property:
        'Property `{{name}}` needs `readonly` in Sumi (or wrap the object type in `Readonly<>` / `DeepReadonly<>`).',
      indexSignature:
        'Index signatures need `readonly` in Sumi (or wrap the object type in `Readonly<>` / `DeepReadonly<>`).',
      mappedType:
        'Mapped types keep `readonly` in Sumi (`{ readonly [K in ...]: ... }`).',
      reference: '`{{name}}` is a mutable type; write {{alternative}} in Sumi.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TSArrayType: (node) => {
      if (isExcluded(node) || isCovered(node, 'array')) return;

      context.report({ node, messageId: 'array' });
    },
    TSTupleType: (node) => {
      if (isExcluded(node) || isCovered(node, 'tuple')) return;

      context.report({ node, messageId: 'tuple' });
    },
    TSTypeReference: (node) => {
      if (node.typeName.type !== AST_NODE_TYPES.Identifier) return;

      const alternative = mutableReferences.get(node.typeName.name);

      if (alternative === undefined) return;

      if (isExcluded(node) || isCovered(node, 'reference')) return;

      context.report({
        node: node.typeName,
        messageId: 'reference',
        data: { name: node.typeName.name, alternative },
      });
    },
    TSPropertySignature: (node) => {
      if (node.readonly) return;

      if (isExcluded(node) || isMemberOfCoveredLiteral(node)) return;

      const name = propertyName(node.key);

      if (name?.startsWith(MUT_PREFIX) === true) return;

      context.report({
        node: node.key,
        messageId: 'property',
        data: { name: name ?? '(computed)' },
      });
    },
    TSIndexSignature: (node) => {
      if (node.readonly) return;

      if (isExcluded(node) || isMemberOfCoveredLiteral(node)) return;

      context.report({ node, messageId: 'indexSignature' });
    },
    TSMappedType: (node) => {
      if (node.readonly === true || node.readonly === '+') return;

      if (isExcluded(node) || isCovered(node, 'mapped')) return;

      context.report({ node, messageId: 'mappedType' });
    },
  }),
});

type AnyNode = DeepReadonly<TSESTree.Node>;

/** The name a property-signature key denotes, when it is a plain name. */
const propertyName = (key: AnyNode): string | undefined =>
  key.type === AST_NODE_TYPES.Identifier
    ? key.name
    : key.type === AST_NODE_TYPES.Literal && typeof key.value === 'string'
      ? key.value
      : undefined;

type Kind = 'array' | 'tuple' | 'reference' | 'mapped';

/**
 * Whether the position already makes the node readonly (the codemod leaves
 * these alone). Unions and intersections are looked through (parentheses do
 * not exist in the AST): `Readonly<A | B>` covers both members.
 *
 * - `readonly T[]` / `readonly [A]`: the readonly type operator.
 * - The direct type argument of `Readonly<>` (arrays, tuples, literals,
 *   mapped types, and `Array` / `Record` references — `Readonly<Map<>>` is
 *   not a `ReadonlyMap` and stays reported).
 * - The object of an indexed access (`{ a: T[] }['a']`, `Record<K, V>[I]`):
 *   the codemod strips `Readonly` there.
 * - The type of a rest element (`readonly [A, ...B[]]`): the tuple's
 *   readonly-ness is what counts; the codemod writes `...B[]`.
 * - A tuple or array used as a distribution guard in a conditional type
 *   (`[A] extends [B] ? ...`, `A[] extends B[] ? ...`).
 */
const isCovered = (node: AnyNode, kind: Kind): boolean => {
  let mut_current: AnyNode = node;

  let mut_parent: AnyNode | undefined = node.parent;

  while (
    mut_parent !== undefined &&
    (mut_parent.type === AST_NODE_TYPES.TSUnionType ||
      mut_parent.type === AST_NODE_TYPES.TSIntersectionType)
  ) {
    mut_current = mut_parent;

    mut_parent = mut_parent.parent;
  }

  if (mut_parent === undefined) return false;

  if (
    mut_parent.type === AST_NODE_TYPES.TSTypeOperator &&
    mut_parent.operator === 'readonly'
  ) {
    return true;
  }

  if (mut_parent.type === AST_NODE_TYPES.TSIndexedAccessType) {
    return mut_parent.objectType === mut_current;
  }

  if (mut_parent.type === AST_NODE_TYPES.TSRestType) {
    return kind === 'array' || kind === 'tuple';
  }

  if (mut_parent.type === AST_NODE_TYPES.TSConditionalType) {
    // The distribution guard (`[A] extends [B]`, `A[] extends B[]`) — in
    // effect only when the check type itself is a tuple or an array.
    const checkType = mut_parent.checkType;

    return (
      (kind === 'tuple' || kind === 'array') &&
      (checkType.type === AST_NODE_TYPES.TSTupleType ||
        checkType.type === AST_NODE_TYPES.TSArrayType) &&
      (checkType === mut_current || mut_parent.extendsType === mut_current)
    );
  }

  const reference = mut_parent.parent;

  const isReadonlyArgument =
    mut_parent.type === AST_NODE_TYPES.TSTypeParameterInstantiation &&
    reference?.type === AST_NODE_TYPES.TSTypeReference &&
    reference.typeName.type === AST_NODE_TYPES.Identifier &&
    shallowReadonlyNames.has(reference.typeName.name) &&
    mut_parent.params[0] === mut_current;

  if (!isReadonlyArgument) return false;

  if (kind !== 'reference') return true;

  // `Readonly<Array<T>>` is a ReadonlyArray and `Readonly<Record<K, V>>` a
  // readonly record; `Readonly<Map<K, V>>` / `Readonly<Set<T>>` are not.
  return (
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    (node.typeName.name === 'Array' || node.typeName.name === 'Record')
  );
};

/** A member of a type literal whose position already makes it readonly. */
const isMemberOfCoveredLiteral = (member: AnyNode): boolean =>
  member.parent?.type === AST_NODE_TYPES.TSTypeLiteral &&
  isCovered(member.parent, 'mapped');

/**
 * Whether a `DeepReadonly<>` / `Mutable<>` reference, or a `mut_`-named
 * declaration, encloses the node — the codemod's skip conditions.
 */
const isExcluded = (node: AnyNode): boolean => {
  // (Walk up to the Program node and stop there: oxlint gives the Program a
  // `null` parent.)
  for (
    let mut_current: AnyNode | undefined = node.parent;
    mut_current !== undefined && mut_current.type !== AST_NODE_TYPES.Program;
    mut_current = mut_current.parent
  ) {
    if (
      mut_current.type === AST_NODE_TYPES.TSTypeReference &&
      mut_current.typeName.type === AST_NODE_TYPES.Identifier &&
      (deepReadonlyNames.has(mut_current.typeName.name) ||
        mutableNames.has(mut_current.typeName.name))
    ) {
      return true;
    }

    if (declaresMutName(mut_current)) return true;
  }

  return false;
};

/** A declaration whose own name carries the `mut_` prefix. */
const declaresMutName = (node: AnyNode): boolean =>
  mutNameOf(node)?.startsWith(MUT_PREFIX) === true;

/** The name a declaration introduces, for the declaration kinds the codemod exempts. */
const mutNameOf = (node: AnyNode): string | undefined => {
  if (
    node.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
    node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
    node.type === AST_NODE_TYPES.FunctionDeclaration
  ) {
    return node.id?.name;
  }

  if (node.type === AST_NODE_TYPES.VariableDeclarator) {
    return node.id.type === AST_NODE_TYPES.Identifier
      ? node.id.name
      : undefined;
  }

  if (node.type === AST_NODE_TYPES.TSPropertySignature) {
    return propertyName(node.key);
  }

  return undefined;
};
