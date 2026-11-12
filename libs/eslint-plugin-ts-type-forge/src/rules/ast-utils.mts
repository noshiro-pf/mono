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
  if (isInConditionalTypeExtendsClause(tuple)) {
    return undefined;
  }

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

  if (hasRest && restElementType === undefined) {
    return undefined;
  }

  const [head] = leading;

  if (head === undefined) {
    return undefined;
  }

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

  return closesDeclarationCycle(tuple, sourceCode)
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
  if (node.type === AST_NODE_TYPES.Program) {
    return false;
  }

  const { parent } = node;

  return (
    (parent.type === AST_NODE_TYPES.TSConditionalType &&
      parent.extendsType === node) ||
    isInConditionalTypeExtendsClause(parent)
  );
};

/** The names a binding pattern binds (`a`, `[a, b]`, `{ a, b: c }`, …). */
const bindingNames = (pattern: TSESTree.Node): readonly string[] => {
  if (pattern.type === AST_NODE_TYPES.Identifier) {
    return [pattern.name];
  }

  if (pattern.type === AST_NODE_TYPES.ArrayPattern) {
    return pattern.elements.flatMap((element) =>
      element === null ? [] : bindingNames(element),
    );
  }

  if (pattern.type === AST_NODE_TYPES.ObjectPattern) {
    return pattern.properties.flatMap((property) =>
      property.type === AST_NODE_TYPES.Property
        ? bindingNames(property.value)
        : bindingNames(property),
    );
  }

  return pattern.type === AST_NODE_TYPES.RestElement
    ? bindingNames(pattern.argument)
    : pattern.type === AST_NODE_TYPES.AssignmentPattern
      ? bindingNames(pattern.left)
      : [];
};

/**
 * The key a class is found by from inside it (`this`, and its own name in a
 * class expression): its name, or for an anonymous class one made from its
 * position, which no code can spell but `this` reaches.
 */
const classKey = (
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): string => node.id?.name ?? `<class at ${node.range[0]}>`;

/**
 * The names `node` declares, if it is a declaration the reference graph has a
 * node for: `type X`, `interface X`, a class (`classKey`), `function X`,
 * `enum X`, `import X = …`, the local name of an import specifier and the
 * bindings of a variable declarator. A `namespace` and a `declare module` have
 * nodes too, but are handled apart (`namespacePath`, `declarationKeys`).
 */
const declaredNames = (node: TSESTree.Node): readonly string[] => {
  if (
    node.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
    node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
    node.type === AST_NODE_TYPES.TSImportEqualsDeclaration ||
    node.type === AST_NODE_TYPES.TSEnumDeclaration
  ) {
    return [node.id.name];
  }

  if (
    node.type === AST_NODE_TYPES.ClassDeclaration ||
    node.type === AST_NODE_TYPES.ClassExpression
  ) {
    return [classKey(node)];
  }

  if (
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.TSDeclareFunction
  ) {
    return node.id === null ? [] : [node.id.name];
  }

  // `import { x as y } from 'm'` declares `y`, which leads to the module.
  if (
    (node.type === AST_NODE_TYPES.ImportSpecifier ||
      node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
      node.type === AST_NODE_TYPES.ImportNamespaceSpecifier) &&
    // Always so at run time; the parser's types also allow an
    // `ExportNamedDeclaration`, whose `source` may be null.
    node.parent.type === AST_NODE_TYPES.ImportDeclaration
  ) {
    return [node.local.name];
  }

  return node.type === AST_NODE_TYPES.VariableDeclarator
    ? bindingNames(node.id)
    : [];
};

/**
 * The `namespace` whose member `node` is — declared directly in its body, or
 * through `export` / a variable declaration — if any. A declaration inside a
 * function or class in the namespace is not a member.
 */
const namespaceOf = (
  node: TSESTree.Node,
): TSESTree.TSModuleDeclaration | undefined => {
  const { parent } = node;

  if (parent === undefined) {
    return undefined;
  }

  if (parent.type === AST_NODE_TYPES.TSModuleBlock) {
    return parent.parent;
  }

  return parent.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    parent.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
    parent.type === AST_NODE_TYPES.VariableDeclaration
    ? namespaceOf(parent)
    : undefined;
};

/**
 * The key of the class `node` sits in (`classKey`).
 */
const enclosingClassKey = (node: TSESTree.Node): string | undefined => {
  const { parent } = node;

  if (parent === undefined) {
    return undefined;
  }

  return parent.type === AST_NODE_TYPES.ClassDeclaration ||
    parent.type === AST_NODE_TYPES.ClassExpression
    ? classKey(parent)
    : enclosingClassKey(parent);
};

/**
 * `N.X.Y` written out, for a name (as a type name or as an expression) made of
 * identifiers, `this` standing for the enclosing class's name (`typeof this.x`
 * leads to the class as `C.x` does); `undefined` for anything else (`a[b]`).
 */
const dottedName = (node: TSESTree.Node): string | undefined => {
  if (node.type === AST_NODE_TYPES.Identifier) {
    return node.name;
  }

  if (node.type === AST_NODE_TYPES.ThisExpression) {
    return enclosingClassKey(node);
  }

  if (node.type === AST_NODE_TYPES.TSQualifiedName) {
    const left = dottedName(node.left);

    return left === undefined ? undefined : `${left}.${node.right.name}`;
  }

  if (
    node.type === AST_NODE_TYPES.MemberExpression &&
    !node.computed &&
    node.property.type === AST_NODE_TYPES.Identifier
  ) {
    const object = dottedName(node.object);

    return object === undefined ? undefined : `${object}.${node.property.name}`;
  }

  return undefined;
};

/**
 * The full path of a namespace: `['A', 'B']` for `namespace A.B`, and for
 * `namespace B` declared in `namespace A`. Empty for `declare module 'm'` and
 * `declare global`, whose members are found by their bare names.
 */
const namespacePath = (
  namespace: TSESTree.TSModuleDeclaration,
): readonly string[] => {
  // `declare global { … }` declares global names, found bare.
  if (
    namespace.id.type === AST_NODE_TYPES.Literal ||
    namespace.kind === 'global'
  ) {
    return [];
  }

  const outer = namespaceOf(namespace);

  return [
    ...(outer === undefined ? [] : namespacePath(outer)),
    ...(dottedName(namespace.id)?.split('.') ?? []),
  ];
};

/** `C`, `B.C`, `A.B.C` of `['A', 'B', 'C']`. */
const tailsOf = (parts: readonly string[]): readonly string[] => {
  const mut_tails: string[] = [];

  let mut_tail: string | undefined = undefined;

  for (const part of parts.toReversed()) {
    mut_tail = mut_tail === undefined ? part : `${part}.${mut_tail}`;

    mut_tails.push(mut_tail);
  }

  return mut_tails;
};

/**
 * The keys a name declared under `path` is found by: bare, as code inside the
 * namespace writes it, and qualified by each tail of the path (`B.X` and
 * `A.B.X` under `['A', 'B']`), as code outside it does.
 */
const keysUnder = (path: readonly string[], name: string): readonly string[] =>
  tailsOf(Arr.toPushed(path, name));

/** The key of `declare module 'm'`, which no name in code can collide with. */
const moduleKey = (name: string): string => `import('${name}')`;

/** The graph keys of the declaration `node`, if it is one (`declaredNames`). */
const declarationKeys = (node: TSESTree.Node): readonly string[] => {
  // `declare module 'm' { … }` is one node, holding everything its body refers
  // to: code outside reaches its members by their exported names (`default`,
  // `export { x as y }`), which this graph does not pair with the local ones,
  // so `import('m')` in any form leads to all of it.
  if (
    node.type === AST_NODE_TYPES.TSModuleDeclaration &&
    node.id.type === AST_NODE_TYPES.Literal
  ) {
    return [moduleKey(node.id.value)];
  }

  const names = declaredNames(node);

  if (Arr.isEmpty(names)) {
    return [];
  }

  const namespace = namespaceOf(node);

  const path = namespace === undefined ? [] : namespacePath(namespace);

  return names.flatMap((name) => keysUnder(path, name));
};

/**
 * The keys of the declarations `node` sits in, from the innermost out. A tuple
 * in a member of `interface X` closes a cycle by leading back to `X` just as
 * one in `type X = …` does.
 */
const enclosingDeclarationKeys = (node: TSESTree.Node): readonly string[] =>
  node.type === AST_NODE_TYPES.Program
    ? []
    : [...declarationKeys(node), ...enclosingDeclarationKeys(node.parent)];

const isNode = (value: unknown): value is TSESTree.Node =>
  isNonNullObject(value) &&
  typeof (value as Readonly<{ type?: unknown }>).type === 'string';

/**
 * The child nodes of `node`.
 *
 * Children are found through the parser's visitor keys, so only the properties
 * that actually hold one are read. Reading every own property instead works
 * too, and is the fallback for a parser that declares no keys for a node type,
 * but it allocates an entry pair per property and walks `loc` / `range` as well
 * — on the generated rule-type files that alone was most of the cost.
 */
const childrenOf = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
): readonly TSESTree.Node[] => {
  if (!isRecord(node)) {
    return [];
  }

  const keys =
    sourceCode.visitorKeys[node.type] ??
    Object.keys(node).filter((key) => key !== 'parent');

  return keys.flatMap((key) => {
    const value: unknown = hasKey(node, key) ? node[key] : undefined;

    return Arr.isArray(value)
      ? value.filter(isNode)
      : isNode(value)
        ? [value]
        : [];
  });
};

/**
 * The names of the file's `declare module 'm'`: exact ones, and `*` patterns
 * longest prefix first. Read once per file.
 */
const declaredModules = (program: TSESTree.Program): DeclaredModules => {
  const cached = declaredModulesCache.get(program);

  if (cached !== undefined) {
    return cached;
  }

  const names = Arr.generate(function* () {
    for (const statement of program.body) {
      const declaration =
        statement.type === AST_NODE_TYPES.ExportNamedDeclaration
          ? statement.declaration
          : statement;

      if (
        declaration?.type === AST_NODE_TYPES.TSModuleDeclaration &&
        declaration.id.type === AST_NODE_TYPES.Literal
      ) {
        yield declaration.id.value;
      }
    }
  });

  const modules: DeclaredModules = {
    exact: new Set<string>(names.filter((name) => !name.includes('*'))),
    patterns: names
      .filter((name) => name.includes('*'))
      .toSorted((a, b) => b.indexOf('*') - a.indexOf('*')),
  };

  declaredModulesCache.set(program, modules);

  return modules;
};

/**
 * The `declare module 'm' { … }` of the file that `specifier` resolves to, by
 * its exact name or a `*` pattern (`'*.css'`), if any: its key.
 */
const declaredModuleKey = (
  program: TSESTree.Program,
  specifier: string,
): string | undefined => {
  const { exact, patterns } = declaredModules(program);

  // An exact name wins over a pattern, and of patterns the longest prefix
  // (`patterns` is sorted so), as TypeScript resolves them.
  const name = exact.has(specifier)
    ? specifier
    : patterns.find((pattern) => {
        const star = pattern.indexOf('*');

        return (
          specifier.length >= pattern.length - 1 &&
          specifier.startsWith(pattern.slice(0, star)) &&
          specifier.endsWith(pattern.slice(star + 1))
        );
      });

  return name === undefined ? undefined : moduleKey(name);
};

type DeclaredModules = Readonly<{
  exact: ReadonlySet<string>;
  patterns: readonly string[];
}>;

/** `'m'` of `import('m')`. */
const importTypeSpecifier = (
  node: TSESTree.TSImportType,
): string | undefined => {
  // `source` is newer than `argument`, and the parser is the project's own: an
  // older one fills in only `argument`.
  const source: unknown = node.source;

  if (
    isRecord(source) &&
    hasKey(source, 'value') &&
    typeof source.value === 'string'
  ) {
    return source.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-deprecated -- read for a parser that predates `source`
  const { argument } = node;

  return argument.type === AST_NODE_TYPES.TSLiteralType &&
    argument.literal.type === AST_NODE_TYPES.Literal &&
    typeof argument.literal.value === 'string'
    ? argument.literal.value
    : undefined;
};

const programOf = (node: TSESTree.Node): TSESTree.Program =>
  node.type === AST_NODE_TYPES.Program ? node : programOf(node.parent);

/** The key of the `declare module` of this file `specifier` names, if any. */
const moduleReferenceOf = (
  node: TSESTree.Node,
  specifier: string,
): string | undefined => declaredModuleKey(programOf(node), specifier);

/**
 * The name `node` itself refers to, not counting its descendants: `X` / `N.X`
 * of a type reference, of `typeof`, of an interface's `extends` and of `import
 * Y = N.X`; and the key of a `declare module 'm'` of this file that
 * `import('m')` (a type or an expression), `import x = require('m')`, an
 * import specifier from `'m'` or an `export … from 'm'` leads to. (A name an
 * identifier reads in a value position counts too: `valueReferenceOf`.)
 *
 * A class's `implements I` is left out on purpose: the class's instance type
 * does not take its members from `I`, so `I` closes no cycle through it.
 */
const referenceOf = (node: TSESTree.Node): string | undefined => {
  if (node.type === AST_NODE_TYPES.TSTypeReference) {
    return dottedName(node.typeName);
  }

  if (node.type === AST_NODE_TYPES.TSTypeQuery) {
    return node.exprName.type === AST_NODE_TYPES.TSImportType
      ? undefined
      : dottedName(node.exprName);
  }

  if (node.type === AST_NODE_TYPES.TSInterfaceHeritage) {
    return dottedName(node.expression);
  }

  if (node.type === AST_NODE_TYPES.TSImportType) {
    // `import('m')`, `import('m').X`: the whole of a `declare module 'm'` of
    // this file (`declarationKeys`); of any other module, nothing here.
    const specifier = importTypeSpecifier(node);

    return specifier === undefined
      ? undefined
      : moduleReferenceOf(node, specifier);
  }

  if (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
    return node.moduleReference.type ===
      AST_NODE_TYPES.TSExternalModuleReference
      ? moduleReferenceOf(node, node.moduleReference.expression.value)
      : dottedName(node.moduleReference);
  }

  // A specifier of `import … from 'm'` (a declaration of its own, so that its
  // local name leads on), and an `export … from 'm'`: the whole of a
  // `declare module 'm'` of this file, as for `import('m')`. A specifier inside
  // a `declare module` is keyed bare like the module's other members, and so
  // shares its node with any declaration of the same spelling.
  if (
    (node.type === AST_NODE_TYPES.ImportSpecifier ||
      node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
      node.type === AST_NODE_TYPES.ImportNamespaceSpecifier) &&
    // Always so at run time; the parser's types also allow an
    // `ExportNamedDeclaration`, whose `source` may be null.
    node.parent.type === AST_NODE_TYPES.ImportDeclaration
  ) {
    return moduleReferenceOf(node, node.parent.source.value);
  }

  // `import('m')` as an expression, whose value is the module, the module's
  // name written as a string or a template literal with no substitution.
  if (node.type === AST_NODE_TYPES.ImportExpression) {
    const { source } = node;

    const specifier =
      source.type === AST_NODE_TYPES.Literal && typeof source.value === 'string'
        ? source.value
        : source.type === AST_NODE_TYPES.TemplateLiteral &&
            Arr.isEmpty(source.expressions)
          ? source.quasis[0]?.value.cooked
          : undefined;

    return specifier === undefined || specifier === null
      ? undefined
      : moduleReferenceOf(node, specifier);
  }

  return (node.type === AST_NODE_TYPES.ExportAllDeclaration ||
    node.type === AST_NODE_TYPES.ExportNamedDeclaration) &&
    node.source !== null
    ? moduleReferenceOf(node, node.source.value)
    : undefined;
};

/** `a.b.c` of the `a` it starts with, as far as the chain is not computed. */
const memberChainTop = (node: TSESTree.Node): TSESTree.Node => {
  const { parent } = node;

  return parent?.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === node &&
    !parent.computed
    ? memberChainTop(parent)
    : node;
};

const isPropertyName = (
  node: TSESTree.Identifier,
  parent: TSESTree.Node,
): boolean =>
  (parent.type === AST_NODE_TYPES.MemberExpression &&
    parent.property === node &&
    !parent.computed) ||
  ((parent.type === AST_NODE_TYPES.Property ||
    parent.type === AST_NODE_TYPES.PropertyDefinition ||
    parent.type === AST_NODE_TYPES.AccessorProperty ||
    parent.type === AST_NODE_TYPES.MethodDefinition ||
    parent.type === AST_NODE_TYPES.TSAbstractPropertyDefinition ||
    parent.type === AST_NODE_TYPES.TSAbstractMethodDefinition ||
    parent.type === AST_NODE_TYPES.TSAbstractAccessorProperty ||
    parent.type === AST_NODE_TYPES.TSPropertySignature ||
    parent.type === AST_NODE_TYPES.TSMethodSignature) &&
    parent.key === node &&
    !parent.computed &&
    // `{ a }` reads `a` as well as naming the property.
    !(parent.type === AST_NODE_TYPES.Property && parent.shorthand)) ||
  (parent.type === AST_NODE_TYPES.TSEnumMember && parent.id === node) ||
  parent.type === AST_NODE_TYPES.TSNamedTupleMember ||
  parent.type === AST_NODE_TYPES.LabeledStatement ||
  parent.type === AST_NODE_TYPES.BreakStatement ||
  parent.type === AST_NODE_TYPES.ContinueStatement ||
  parent.type === AST_NODE_TYPES.MetaProperty;

/**
 * Whether `node` is part of a name `referenceOf` reads whole — a type name, a
 * `typeof` operand, a heritage clause, an `import Y = N.X` — or the qualifier
 * of an `import('m')` type, which names a module's member, not a local name.
 */
const isTypeNamePart = (node: TSESTree.Node): boolean => {
  const { parent } = node;

  if (parent === undefined) {
    return false;
  }

  if (
    parent.type === AST_NODE_TYPES.TSQualifiedName ||
    (parent.type === AST_NODE_TYPES.MemberExpression && parent.object === node)
  ) {
    return isTypeNamePart(parent);
  }

  return (
    (parent.type === AST_NODE_TYPES.TSTypeReference &&
      parent.typeName === node) ||
    (parent.type === AST_NODE_TYPES.TSTypeQuery && parent.exprName === node) ||
    ((parent.type === AST_NODE_TYPES.TSInterfaceHeritage ||
      parent.type === AST_NODE_TYPES.TSClassImplements) &&
      parent.expression === node) ||
    (parent.type === AST_NODE_TYPES.TSImportEqualsDeclaration &&
      parent.moduleReference === node) ||
    // `import('m').X` names a member of a module, not the local `X`; the
    // import type leads to the module itself (`referenceOf`).
    parent.type === AST_NODE_TYPES.TSImportType
  );
};

/** Whether `node` is a name being declared, which reads nothing. */
const isBindingName = (
  node: TSESTree.Identifier,
  parent: TSESTree.Node,
): boolean =>
  ((parent.type === AST_NODE_TYPES.VariableDeclarator ||
    parent.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
    parent.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
    parent.type === AST_NODE_TYPES.ClassDeclaration ||
    parent.type === AST_NODE_TYPES.ClassExpression ||
    parent.type === AST_NODE_TYPES.FunctionDeclaration ||
    parent.type === AST_NODE_TYPES.FunctionExpression ||
    parent.type === AST_NODE_TYPES.TSDeclareFunction ||
    parent.type === AST_NODE_TYPES.TSModuleDeclaration ||
    parent.type === AST_NODE_TYPES.TSImportEqualsDeclaration ||
    parent.type === AST_NODE_TYPES.TSEnumDeclaration) &&
    parent.id === node) ||
  (parent.type === AST_NODE_TYPES.TSTypeParameter && parent.name === node) ||
  (parent.type === AST_NODE_TYPES.TSMappedType && parent.key === node) ||
  // `x is T` names the parameter `x`.
  (parent.type === AST_NODE_TYPES.TSTypePredicate &&
    parent.parameterName === node) ||
  (parent.type === AST_NODE_TYPES.TSIndexSignature &&
    parent.parameters.includes(node)) ||
  (parent.type === AST_NODE_TYPES.CatchClause && parent.param === node) ||
  (parent.type === AST_NODE_TYPES.AssignmentPattern && parent.left === node) ||
  parent.type === AST_NODE_TYPES.ArrayPattern ||
  parent.type === AST_NODE_TYPES.RestElement ||
  // `{ a }` and `{ x: a }` in a pattern: the key of a shorthand is a node of
  // its own, beside the value it binds.
  (parent.type === AST_NODE_TYPES.Property &&
    parent.parent.type === AST_NODE_TYPES.ObjectPattern &&
    (parent.value === node || (parent.shorthand && parent.key === node))) ||
  parent.type === AST_NODE_TYPES.ImportSpecifier ||
  parent.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
  parent.type === AST_NODE_TYPES.ImportNamespaceSpecifier ||
  parent.type === AST_NODE_TYPES.ExportSpecifier ||
  ((parent.type === AST_NODE_TYPES.FunctionDeclaration ||
    parent.type === AST_NODE_TYPES.FunctionExpression ||
    parent.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    parent.type === AST_NODE_TYPES.TSDeclareFunction ||
    parent.type === AST_NODE_TYPES.TSEmptyBodyFunctionExpression ||
    parent.type === AST_NODE_TYPES.TSFunctionType ||
    parent.type === AST_NODE_TYPES.TSMethodSignature ||
    parent.type === AST_NODE_TYPES.TSCallSignatureDeclaration ||
    parent.type === AST_NODE_TYPES.TSConstructSignatureDeclaration ||
    parent.type === AST_NODE_TYPES.TSConstructorType) &&
    parent.params.includes(node)) ||
  (parent.type === AST_NODE_TYPES.TSParameterProperty &&
    parent.parameter === node);

/**
 * The name an identifier in a value position reads: `a` of `const b = a`, `f`
 * of `f()`, `p` of a class field `x = p`, `Base` of `extends mix(Base)`, `v` of
 * `v.x` — a value's type can be inferred from any of them, so `typeof b` leads
 * on through `a`.
 *
 * Not one: a property name (`v.x`, `{ x: 1 }`, `x: T`), a name `referenceOf`
 * already reads as part of a type name or heritage clause, and a name being
 * declared (a declaration's id, a parameter, a binding pattern), which refers
 * to nothing. An identifier this keeps that names no declaration of the file
 * adds nothing; one that collides with an unrelated declaration only adds an
 * edge.
 */
const valueReferenceOf = (node: TSESTree.Node): string | undefined => {
  if (node.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const { parent } = node;

  if (
    isPropertyName(node, parent) ||
    isTypeNamePart(node) ||
    isBindingName(node, parent)
  ) {
    return undefined;
  }

  // `N.make()` reads `N.make`, `v.x` reads `v.x`, `globalThis.make()` the
  // global `make`: the whole member chain, which `keyCandidates` takes apart.
  return dottedName(memberChainTop(node)) ?? node.name;
};

/**
 * Calls `onReference` for every name referred to in `node`'s subtree, with the
 * keys of the declarations within the subtree that the reference sits in.
 */
const forEachReference = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
  onReference: (referenced: string, declarations: readonly string[]) => void,
  enclosing: readonly string[] = [],
): void => {
  const declared = declarationKeys(node);

  const inside = Arr.isEmpty(declared)
    ? enclosing
    : [...enclosing, ...declared];

  const name = referenceOf(node) ?? valueReferenceOf(node);

  if (name !== undefined) {
    onReference(name, inside);
  }

  for (const child of childrenOf(node, sourceCode)) {
    forEachReference(child, sourceCode, onReference, inside);
  }
};

/**
 * The edges that make a namespace reachable as a whole, for `typeof N`: from
 * each key of the namespace (`B` and `A.B` for `A.B`, and `A` for its outer
 * part) to the fully qualified key of each of its members, nested namespaces
 * included.
 */
const forEachNamespaceEdge = (
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode,
  onEdge: (from: string, to: string) => void,
): void => {
  const names = declaredNames(node);

  const namespace = Arr.isEmpty(names) ? undefined : namespaceOf(node);

  // A `declare module 'm'` holds its members' references itself
  // (`declarationKeys`), so only a namespace's members are linked here.
  if (namespace !== undefined && namespace.id.type !== AST_NODE_TYPES.Literal) {
    const path = namespacePath(namespace);

    for (const name of names) {
      const member = Arr.toPushed(path, name).join('.');

      for (const key of tailsOf(path)) {
        onEdge(key, member);
      }
    }
  }

  if (node.type === AST_NODE_TYPES.TSModuleDeclaration) {
    const path = namespacePath(node);

    // `namespace A.B` and `namespace B` in `namespace A` are members of `A`.
    for (const [index, part] of path.entries()) {
      if (index === 0) {
        continue;
      }

      const outer = path.slice(0, index);

      for (const key of tailsOf(outer)) {
        onEdge(key, Arr.toPushed(outer, part).join('.'));
      }
    }
  }

  for (const child of childrenOf(node, sourceCode)) {
    forEachNamespaceEdge(child, sourceCode, onEdge);
  }
};

/** Whether a top-level statement is or exports a `namespace`. */
const containsNamespace = (statement: TSESTree.ProgramStatement): boolean =>
  statement.type === AST_NODE_TYPES.TSModuleDeclaration ||
  (statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
    statement.declaration?.type === AST_NODE_TYPES.TSModuleDeclaration);

/**
 * Which names each declaration in the file refers to, keyed by the names it is
 * found by (`declarationKeys`). A declaration counts as a whole — an alias's
 * type parameters, an interface's or class's members and heritage clauses, a
 * function's signature, a variable's annotation and initializer (where `typeof`
 * of it reads its type from). Bodies count too, although only signatures
 * matter: telling the two apart would need a second notion of which subtrees
 * hold edges, and a body only adds edges, which can only suppress more
 * rewrites.
 *
 * Keyed by name, not by binding, so declarations of one name in different
 * scopes share a node and their sets are merged: a name reused in a function
 * must not hide the edges of the outer declaration. Types and values share it
 * too, so `typeof X` reaches a `type X` as well as a `const X`. Both only add
 * edges, so their cost is a rewrite withheld where two unrelated declarations
 * share a name (a local `result` and a top-level one). Telling them apart means
 * resolving each name to its binding through `sourceCode.scopeManager`
 * instead of by spelling, which would replace this graph's keys altogether;
 * until then a shared spelling costs a rewrite, never a broken one.
 *
 * Built once per file and cached on the `Program` node: the search below runs
 * per candidate tuple, and rebuilding this for each of them made the rule cost
 * `O(tuples × file size)` — a full second on the largest generated files here.
 */
const declarationReferenceGraph = (
  program: TSESTree.Program,
  sourceCode: TSESLint.SourceCode,
): ReferenceGraph => {
  const cached = declarationReferenceGraphCache.get(program);

  if (cached !== undefined) {
    return cached;
  }

  const mut_graph = new Map<string, Set<string>>();

  const addEdge = (from: string, to: string): void => {
    const mut_names = mut_graph.get(from);

    if (mut_names === undefined) {
      mut_graph.set(from, new Set<string>([to]));
    } else {
      mut_names.add(to);
    }
  };

  forEachReference(program, sourceCode, (name, enclosing) => {
    for (const declaration of enclosing) {
      addEdge(declaration, name);
    }
  });

  const declarationKeysWithEdges = new Set<string>(mut_graph.keys());

  const mut_namespaceKeys = new Set<string>();

  // A second walk, but only for a file that declares a namespace: the keys it
  // adds exist only there, and most files, the large generated ones included,
  // declare none. (A `declare module` counts, as it may hold one.)
  if (program.body.some(containsNamespace)) {
    forEachNamespaceEdge(program, sourceCode, (from, to) => {
      addEdge(from, to);

      mut_namespaceKeys.add(from);

      // A member is found by its qualified key even when it refers to nothing,
      // so that `N.X` stops there rather than falling back to `N`.
      if (!mut_graph.has(to)) {
        mut_graph.set(to, new Set<string>());
      }
    });
  }

  const graph: ReferenceGraph = {
    edges: mut_graph,
    namespaceOnlyKeys: mut_namespaceKeys.difference(declarationKeysWithEdges),
  };

  declarationReferenceGraphCache.set(program, graph);

  return graph;
};

/**
 * `N.X.Y`, `N.X`, `N`, longest first. (A loop, as `tailsOf` is: each form
 * extends the one before it.)
 */
const prefixesOf = (name: string): readonly string[] => {
  const mut_candidates: string[] = [];

  let mut_prefix: string | undefined = undefined;

  for (const part of name.split('.')) {
    mut_prefix = mut_prefix === undefined ? part : `${mut_prefix}.${part}`;

    mut_candidates.push(mut_prefix);
  }

  return mut_candidates.toReversed();
};

/**
 * `N.X.Y`, then `N.X`, then `N`: the keys a qualified name may be found by,
 * longest first. `globalThis.X` is found as `X` as well, as a global
 * declaration is keyed bare.
 */
const keyCandidates = (name: string): readonly string[] =>
  name.startsWith(globalThisPrefix)
    ? [...prefixesOf(name), ...prefixesOf(name.slice(globalThisPrefix.length))]
    : prefixesOf(name);

const globalThisPrefix = 'globalThis.';

/**
 * Whether the tuple sits in a declaration that its own element type leads back
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
 * the other declarations in the file rather than looking for the enclosing name
 * in the element text.
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
 * The tuple may also sit in an interface, a class, a function or a variable
 * declaration, and a cycle back to any declaration it sits in counts — so
 * `interface Tree { kids: readonly [Tree, Tree] }` and a class method returning
 * `readonly [Vec, Vec]` are left alone too, although their rewrites compile:
 * a member's type is deferred just as an object type's is, and the same
 * reasoning above keeps this from telling the safe cycles from the others.
 *
 * A name declared in a `namespace` is found both bare and qualified (`N.X`, and
 * `B.X` and `A.B.X` in `namespace A.B`), and `typeof N` leads to every member
 * of `N`; a qualified name that matches no declaration of the file is followed
 * by its longest part that does (`typeof v.x` by `v`), or not at all
 * (`vscode.Range`).
 *
 * A `declare module 'm'` of this file is one node, which `import('m')`,
 * `import … from 'm'`, `export … from 'm'` and `import x = require('m')` all
 * lead to as a whole. A cycle closed through a module this file does not
 * declare is not followed, unless a name it reaches happens to match a
 * declaration of this file.
 */
const closesDeclarationCycle = (
  tuple: TSESTree.TSTupleType,
  sourceCode: TSESLint.SourceCode,
): boolean => {
  const enclosingKeys = new Set<string>(enclosingDeclarationKeys(tuple));

  if (enclosingKeys.size === 0) {
    return false;
  }

  const references = declarationReferenceGraph(programOf(tuple), sourceCode);

  // A search per tuple, over what its elements reach — at worst the whole
  // graph, so a file with many uniform tuples in declarations pays O(tuples ×
  // graph) here, as it once did to build the graph. The search stops at the
  // first cycle and most reach only a few declarations; strongly connected
  // components computed once per file would bound it, if a file turns out to
  // need it.
  const mut_seen = new Set<string>();

  const mut_queue: string[] = [];

  for (const element of tuple.elementTypes) {
    forEachReference(element, sourceCode, (name) => {
      mut_queue.push(name);
    });
  }

  while (true) {
    const next = mut_queue.pop();

    if (next === undefined) {
      return false;
    }

    if (mut_seen.has(next)) {
      continue;
    }

    mut_seen.add(next);

    // Every form of the name that the file declares, longest first (`v.x` of a
    // variable `v`, `B.X` of `namespace A.B` and of a variable `B` alike) —
    // save a namespace's own key once a member of it matched, which would lead
    // to every other member of the namespace too.
    let mut_matched = false;

    for (const candidate of keyCandidates(next)) {
      if (enclosingKeys.has(candidate)) {
        return true;
      }

      const edges = references.edges.get(candidate);

      if (
        edges === undefined ||
        (mut_matched && references.namespaceOnlyKeys.has(candidate))
      ) {
        continue;
      }

      mut_queue.push(...edges);

      mut_matched = true;
    }
  }
};

const declaredModulesCache = new WeakMap<TSESTree.Program, DeclaredModules>();

const declarationReferenceGraphCache = new WeakMap<
  TSESTree.Program,
  ReferenceGraph
>();

type ReferenceGraph = Readonly<{
  /** What each key leads to (`declarationReferenceGraph`). */
  edges: ReadonlyMap<string, ReadonlySet<string>>;
  /**
   * The keys only a namespace is found by, which lead to every member of it:
   * `N` of `N.X`, followed only when no longer form of the name is a key.
   */
  namespaceOnlyKeys: ReadonlySet<string>;
}>;

/** Unwraps `V[]` and `readonly V[]` to `V`. */
const getArrayElementType = (
  node: TSESTree.TypeNode,
): TSESTree.TypeNode | undefined => {
  if (node.type === AST_NODE_TYPES.TSArrayType) {
    return node.elementType;
  }

  return node.type === AST_NODE_TYPES.TSTypeOperator &&
    node.operator === 'readonly' &&
    node.typeAnnotation?.type === AST_NODE_TYPES.TSArrayType
    ? node.typeAnnotation.elementType
    : undefined;
};

const normalizeWhitespace = (text: string): string =>
  text.replaceAll(/\s+/gu, ' ').trim();
