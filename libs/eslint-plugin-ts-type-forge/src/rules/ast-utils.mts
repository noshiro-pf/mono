import {
  AST_NODE_TYPES,
  TSESLint,
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
 * Whether `node` is a declaration the reference graph has a node for: `type
 * X`, `interface X`, a class, a function, `enum X`, `import X = …`, a
 * specifier of `import … from 'm'`, a variable declarator, a `namespace` and a
 * `declare module` (or `declare global`).
 */
const isDeclaration = (node: TSESTree.Node): boolean =>
  node.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
  node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
  node.type === AST_NODE_TYPES.TSImportEqualsDeclaration ||
  node.type === AST_NODE_TYPES.TSEnumDeclaration ||
  node.type === AST_NODE_TYPES.TSModuleDeclaration ||
  node.type === AST_NODE_TYPES.ClassDeclaration ||
  node.type === AST_NODE_TYPES.ClassExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration ||
  node.type === AST_NODE_TYPES.TSDeclareFunction ||
  node.type === AST_NODE_TYPES.VariableDeclarator ||
  ((node.type === AST_NODE_TYPES.ImportSpecifier ||
    node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
    node.type === AST_NODE_TYPES.ImportNamespaceSpecifier) &&
    // Always so at run time; the parser's types also allow an
    // `ExportNamedDeclaration`, whose `source` may be null.
    node.parent.type === AST_NODE_TYPES.ImportDeclaration);

/** The declarations `node` sits in (itself included), from the innermost out. */
const enclosingDeclarations = (
  node: TSESTree.Node,
): readonly TSESTree.Node[] =>
  node.type === AST_NODE_TYPES.Program
    ? []
    : isDeclaration(node)
      ? Arr.toUnshifted(node)(enclosingDeclarations(node.parent))
      : enclosingDeclarations(node.parent);

/** The class `node` sits in, if any. */
const enclosingClass = (node: TSESTree.Node): TSESTree.Node | undefined => {
  if (node.type === AST_NODE_TYPES.Program) {
    return undefined;
  }

  const { parent } = node;

  return parent.type === AST_NODE_TYPES.ClassDeclaration ||
    parent.type === AST_NODE_TYPES.ClassExpression
    ? parent
    : enclosingClass(parent);
};

/** `['A', 'B', 'C']` of `A.B.C`. */
const qualifiedParts = (name: TSESTree.EntityName): readonly string[] =>
  name.type === AST_NODE_TYPES.Identifier
    ? [name.name]
    : name.type === AST_NODE_TYPES.TSQualifiedName
      ? Arr.toPushed(qualifiedParts(name.left), name.right.name)
      : [];

/**
 * The name a declaration other than a variable declares, as code reads it: a
 * dotted `namespace A.B` by its first part, `A`.
 */
const declaredName = (node: TSESTree.Node): string | undefined => {
  if (
    node.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
    node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
    node.type === AST_NODE_TYPES.TSEnumDeclaration ||
    node.type === AST_NODE_TYPES.TSImportEqualsDeclaration
  ) {
    return node.id.name;
  }

  if (
    node.type === AST_NODE_TYPES.ClassDeclaration ||
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.TSDeclareFunction
  ) {
    return node.id?.name;
  }

  return node.type === AST_NODE_TYPES.TSModuleDeclaration &&
    node.id.type !== AST_NODE_TYPES.Literal
    ? qualifiedParts(node.id)[0]
    : undefined;
};

/**
 * The declarations directly in the body of a `namespace` (or `declare global`)
 * that declare `name`, exported or not; a nested `namespace` by its first part.
 */
const membersNamed = (
  namespace: TSESTree.TSModuleDeclaration,
  name: string,
): readonly TSESTree.Node[] =>
  (namespace.body?.body ?? []).flatMap(
    (statement): readonly TSESTree.Node[] => {
      const declaration =
        statement.type === AST_NODE_TYPES.ExportNamedDeclaration ||
        statement.type === AST_NODE_TYPES.ExportDefaultDeclaration
          ? statement.declaration
          : statement;

      if (declaration === null) {
        return [];
      }

      if (declaration.type === AST_NODE_TYPES.VariableDeclaration) {
        return declaration.declarations.filter((declarator) =>
          bindingNames(declarator.id).includes(name),
        );
      }

      return declaredName(declaration) === name ? [declaration] : [];
    },
  );

/**
 * The names read off `identifier` after it, in `N.X.Y` (a type name, or a
 * member chain as far as it is not computed): `['X', 'Y']`.
 */
const memberNamesAfter = (identifier: TSESTree.Node): readonly string[] => {
  const { parent } = identifier;

  if (
    parent?.type === AST_NODE_TYPES.TSQualifiedName &&
    parent.left === identifier
  ) {
    return Arr.toUnshifted(parent.right.name)(memberNamesAfter(parent));
  }

  return parent?.type === AST_NODE_TYPES.MemberExpression &&
    parent.object === identifier &&
    !parent.computed &&
    parent.property.type === AST_NODE_TYPES.Identifier
    ? Arr.toUnshifted(parent.property.name)(memberNamesAfter(parent))
    : [];
};

/**
 * `declarations` followed into their members along `names`: `N.X` leads to the
 * member `X` of a `namespace N`, rather than to all of `N`, as far as a
 * namespace declares the next name; where none does (`v.x` of a variable), the
 * declarations reached so far.
 */
const followMembers = (
  declarations: readonly TSESTree.Node[],
  names: readonly string[],
): readonly TSESTree.Node[] => {
  if (Arr.isEmpty(names)) {
    return declarations;
  }

  const reached = lookupMembers(declarations, names);

  return Arr.isNonEmpty(reached) ? reached : declarations;
};

/**
 * One step of `names` into `declaration`, if it is a namespace: past its own
 * parts (`namespace A.B { … }` is reached as `A`, so `B` comes first), then
 * into the member of its body the next name names.
 */
const stepInto = (
  declaration: TSESTree.Node,
  names: readonly string[],
): readonly Readonly<{
  declaration: TSESTree.Node;
  rest: readonly string[];
}>[] => {
  if (
    declaration.type !== AST_NODE_TYPES.TSModuleDeclaration ||
    declaration.id.type === AST_NODE_TYPES.Literal
  ) {
    return [];
  }

  const ownParts = Arr.tail(qualifiedParts(declaration.id));

  const mismatch = ownParts.findIndex((part, index) => names[index] !== part);

  if (mismatch !== -1) {
    // `A.B` of `namespace A.B.C`: the declaration as a whole.
    return mismatch < names.length ? [] : [{ declaration, rest: [] }];
  }

  const rest = names.slice(ownParts.length);

  const [next] = rest;

  const after = Arr.tail(rest);

  return next === undefined
    ? [{ declaration, rest }]
    : membersNamed(declaration, next).map((member) => ({
        declaration: member,
        rest: after,
      }));
};

/**
 * What `names` reach from `declarations` ({@link followMembers}), or nothing
 * where no namespace among them declares the first name.
 */
const lookupMembers = (
  declarations: readonly TSESTree.Node[],
  names: readonly string[],
): readonly TSESTree.Node[] =>
  declarations
    .flatMap((declaration) => stepInto(declaration, names))
    .flatMap(({ declaration, rest }) => followMembers([declaration], rest));

/**
 * Every block of the namespace `declaration` is one of, in the same statement
 * list: `namespace A { … }` and `namespace A.B { … }` beside it are both `A`,
 * though the scope manager binds `A` to the first alone.
 */
const namespaceBlocks = (
  declaration: TSESTree.Node,
): readonly TSESTree.Node[] => {
  if (
    declaration.type !== AST_NODE_TYPES.TSModuleDeclaration ||
    declaration.id.type === AST_NODE_TYPES.Literal
  ) {
    return [declaration];
  }

  const holder =
    declaration.parent.type === AST_NODE_TYPES.ExportNamedDeclaration
      ? declaration.parent.parent
      : declaration.parent;

  const statements =
    holder.type === AST_NODE_TYPES.Program ||
    holder.type === AST_NODE_TYPES.TSModuleBlock
      ? holder.body
      : [];

  const name = declaredName(declaration);

  const blocks = Arr.generate(function* () {
    for (const statement of statements) {
      const candidate =
        statement.type === AST_NODE_TYPES.ExportNamedDeclaration
          ? statement.declaration
          : statement;

      if (
        candidate?.type === AST_NODE_TYPES.TSModuleDeclaration &&
        declaredName(candidate) === name
      ) {
        yield candidate;
      }
    }
  });

  return Arr.isNonEmpty(blocks) ? blocks : [declaration];
};

/** The namespaces `node` sits in, from the innermost out. */
const enclosingNamespaces = (
  node: TSESTree.Node,
): readonly TSESTree.TSModuleDeclaration[] => {
  if (node.type === AST_NODE_TYPES.Program) {
    return [];
  }

  const { parent } = node;

  return parent.type === AST_NODE_TYPES.TSModuleDeclaration &&
    parent.id.type !== AST_NODE_TYPES.Literal &&
    parent.kind !== 'global'
    ? Arr.toUnshifted(parent)(enclosingNamespaces(parent))
    : enclosingNamespaces(parent);
};

/**
 * The declaration a definition of the scope manager stands for: the node it
 * names when that is one the graph keys (`isDeclaration`), else the nearest one
 * around it (an enum member's enum). A parameter, a type parameter and an
 * implicit global lead nowhere: they hold no declaration of their own.
 */
const declarationOf = (
  definition: TSESLint.Scope.Definition,
): TSESTree.Node | undefined => {
  const { type, node } = definition;

  if (
    type === TSESLint.Scope.DefinitionType.Parameter ||
    type === TSESLint.Scope.DefinitionType.ImplicitGlobalVariable ||
    type === TSESLint.Scope.DefinitionType.CatchClause ||
    node.type === AST_NODE_TYPES.TSTypeParameter
  ) {
    return undefined;
  }

  return isDeclaration(node) ? node : enclosingDeclarations(node)[0];
};

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
 * The file's `declare module 'm'` by name, exact ones and `*` patterns (longest
 * prefix first), and its `declare global` blocks. Read once per file.
 */
const moduleDeclarations = (program: TSESTree.Program): ModuleDeclarations => {
  const mut_byName = new Map<string, readonly TSESTree.TSModuleDeclaration[]>();

  const mut_globals: TSESTree.TSModuleDeclaration[] = [];

  for (const statement of program.body) {
    const declaration =
      statement.type === AST_NODE_TYPES.ExportNamedDeclaration
        ? statement.declaration
        : statement;

    if (declaration?.type !== AST_NODE_TYPES.TSModuleDeclaration) {
      continue;
    }

    if (declaration.kind === 'global') {
      mut_globals.push(declaration);
    } else if (declaration.id.type === AST_NODE_TYPES.Literal) {
      const name = declaration.id.value;

      mut_byName.set(
        name,
        Arr.toPushed(mut_byName.get(name) ?? [], declaration),
      );
    }
  }

  const names = Array.from(mut_byName.keys());

  return {
    byName: mut_byName,
    patterns: names
      .filter((name) => name.includes('*'))
      .toSorted((a, b) => b.indexOf('*') - a.indexOf('*')),
    globals: mut_globals,
  };
};

type ModuleDeclarations = Readonly<{
  byName: ReadonlyMap<string, readonly TSESTree.TSModuleDeclaration[]>;
  patterns: readonly string[];
  globals: readonly TSESTree.TSModuleDeclaration[];
}>;

/**
 * The `declare module 'm' { … }` of the file that `specifier` resolves to, by
 * its exact name or a `*` pattern (`'*.css'`), if any.
 */
const declaredModulesFor = (
  modules: ModuleDeclarations,
  specifier: string,
): readonly TSESTree.Node[] => {
  // An exact name wins over a pattern, and of patterns the longest prefix
  // (`patterns` is sorted so), as TypeScript resolves them.
  const name =
    !specifier.includes('*') && modules.byName.has(specifier)
      ? specifier
      : modules.patterns.find((pattern) => {
          const star = pattern.indexOf('*');

          return (
            specifier.length >= pattern.length - 1 &&
            specifier.startsWith(pattern.slice(0, star)) &&
            specifier.endsWith(pattern.slice(star + 1))
          );
        });

  return name === undefined ? [] : (modules.byName.get(name) ?? []);
};

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

/**
 * The module a node names as a whole, if it is one that does: `import('m')`
 * (a type or an expression, its name written as a string or a template literal
 * with no substitution), `import x = require('m')`, a specifier of `import …
 * from 'm'` and `export … from 'm'`. A `declare module 'm'` of this file is
 * one node of the graph, which every one of them leads to.
 */
const moduleSpecifierOf = (node: TSESTree.Node): string | undefined => {
  if (node.type === AST_NODE_TYPES.TSImportType) {
    return importTypeSpecifier(node);
  }

  if (node.type === AST_NODE_TYPES.TSImportEqualsDeclaration) {
    return node.moduleReference.type ===
      AST_NODE_TYPES.TSExternalModuleReference
      ? node.moduleReference.expression.value
      : undefined;
  }

  if (
    (node.type === AST_NODE_TYPES.ImportSpecifier ||
      node.type === AST_NODE_TYPES.ImportDefaultSpecifier ||
      node.type === AST_NODE_TYPES.ImportNamespaceSpecifier) &&
    node.parent.type === AST_NODE_TYPES.ImportDeclaration
  ) {
    return node.parent.source.value;
  }

  if (node.type === AST_NODE_TYPES.ImportExpression) {
    const { source } = node;

    const specifier =
      source.type === AST_NODE_TYPES.Literal && typeof source.value === 'string'
        ? source.value
        : source.type === AST_NODE_TYPES.TemplateLiteral &&
            Arr.isEmpty(source.expressions)
          ? source.quasis[0]?.value.cooked
          : undefined;

    return specifier ?? undefined;
  }

  return (node.type === AST_NODE_TYPES.ExportAllDeclaration ||
    node.type === AST_NODE_TYPES.ExportNamedDeclaration) &&
    node.source !== null
    ? node.source.value
    : undefined;
};

/** Whether `node` sits in a class's `implements` clause. */
const isInImplements = (node: TSESTree.Node): boolean => {
  if (node.type === AST_NODE_TYPES.Program) {
    return false;
  }

  const { parent } = node;

  return (
    parent.type === AST_NODE_TYPES.TSClassImplements ||
    ((parent.type === AST_NODE_TYPES.TSQualifiedName ||
      parent.type === AST_NODE_TYPES.MemberExpression ||
      parent.type === AST_NODE_TYPES.TSTypeReference) &&
      isInImplements(parent))
  );
};

const thisHead = (node: TSESTree.Node): TSESTree.Node | undefined =>
  node.type === AST_NODE_TYPES.ThisExpression
    ? node
    : node.type === AST_NODE_TYPES.TSQualifiedName
      ? thisHead(node.left)
      : node.type === AST_NODE_TYPES.MemberExpression
        ? thisHead(node.object)
        : undefined;

/** The head of `this.x.y` in a `typeof`, whose `this` leads to the class. */
const isTypeofThis = (node: TSESTree.Node): boolean =>
  node.type === AST_NODE_TYPES.TSTypeQuery &&
  thisHead(node.exprName) !== undefined;

/**
 * Which declarations each declaration of the file leads to, and what each
 * reference in the file leads to (`targets`, keyed by the node that refers).
 *
 * A reference is resolved through `sourceCode.scopeManager`, so a name leads to
 * the declaration it binds to and no other of the same spelling: a local `pair`
 * in one function and a namespace member `Pair` are nodes apart from a
 * top-level `Pair`. A name resolved to a `namespace` is followed into the member
 * a qualified name reads (`followMembers`); one the scope manager leaves
 * unresolved is looked up among the file's `declare global` members, as is
 * `globalThis.X`, and is otherwise followed no further (another module, a
 * global of the environment). A reference in a class's `implements` clause is
 * left out: the instance type does not take its members from it.
 *
 * Besides names, `typeof this.x` leads to the class it sits in, and the module
 * forms of `moduleSpecifierOf` lead to the file's `declare module` of that name.
 *
 * A declaration counts as a whole — an alias's type parameters, an interface's
 * or class's members and heritage clauses, a function's signature and body, a
 * variable's annotation and initializer — so a reference anywhere inside it is
 * an edge from it, and from every declaration around it.
 *
 * Built once per file and cached on the `Program` node: the search below runs
 * per candidate tuple.
 */
const declarationReferenceGraph = (
  program: TSESTree.Program,
  sourceCode: TSESLint.SourceCode,
): ReferenceGraph => {
  const cached = declarationReferenceGraphCache.get(program);

  if (cached !== undefined) {
    return cached;
  }

  const mut_edges = new Map<TSESTree.Node, Set<TSESTree.Node>>();

  const mut_targets = new Map<TSESTree.Node, TSESTree.Node[]>();

  const modules = moduleDeclarations(program);

  const globalMembers = (name: string): readonly TSESTree.Node[] =>
    modules.globals.flatMap((block) => membersNamed(block, name));

  // A name the scope manager does not resolve: a member of a block of a
  // namespace around it that it does not bind (`B` in `namespace A { … }`, of
  // `namespace A.B { … }` beside it), else a `declare global` member.
  const unresolvedTargets = (
    identifier: TSESTree.Node,
    name: string,
    names: readonly string[],
  ): readonly TSESTree.Node[] => {
    for (const namespace of enclosingNamespaces(identifier)) {
      const found = lookupMembers(
        namespaceBlocks(namespace),
        Arr.toUnshifted(name)(names),
      );

      if (Arr.isNonEmpty(found)) {
        return found;
      }
    }

    // `A` of `namespace A.B { … }` alone, which binds no `A`.
    const topLevel = Arr.generate(function* () {
      for (const statement of program.body) {
        const candidate =
          statement.type === AST_NODE_TYPES.ExportNamedDeclaration
            ? statement.declaration
            : statement;

        if (
          candidate?.type === AST_NODE_TYPES.TSModuleDeclaration &&
          declaredName(candidate) === name
        ) {
          yield candidate;
        }
      }
    });

    return followMembers(
      Arr.isNonEmpty(topLevel) ? topLevel : globalMembers(name),
      names,
    );
  };

  const addReference = (
    from: TSESTree.Node,
    to: readonly TSESTree.Node[],
  ): void => {
    if (Arr.isEmpty(to)) {
      return;
    }

    mut_targets.set(from, [...(mut_targets.get(from) ?? []), ...to]);

    for (const declaration of enclosingDeclarations(from)) {
      const mut_set = mut_edges.get(declaration) ?? new Set<TSESTree.Node>();

      for (const target of to) {
        mut_set.add(target);
      }

      mut_edges.set(declaration, mut_set);
    }
  };

  for (const scope of sourceCode.scopeManager?.scopes ?? []) {
    for (const reference of scope.references) {
      const { identifier } = reference;

      if (isInImplements(identifier)) {
        continue;
      }

      const names = memberNamesAfter(identifier);

      // A global of the environment (`globalThis`, `Array`) resolves to a
      // variable with no definition: as good as unresolved.
      const definitions = reference.resolved?.defs ?? [];

      const name =
        identifier.type === AST_NODE_TYPES.Identifier
          ? identifier.name
          : undefined;

      const [first, ...rest] = names;

      addReference(
        identifier,
        Arr.isNonEmpty(definitions)
          ? followMembers(
              definitions.flatMap((definition) => {
                const declaration = declarationOf(definition);

                return declaration === undefined
                  ? []
                  : namespaceBlocks(declaration);
              }),
              names,
            )
          : name === 'globalThis'
            ? first === undefined
              ? []
              : followMembers(globalMembers(first), rest)
            : name === undefined
              ? []
              : unresolvedTargets(identifier, name, names),
      );
    }
  }

  const visit = (node: TSESTree.Node): void => {
    const specifier = moduleSpecifierOf(node);

    if (specifier !== undefined) {
      addReference(node, declaredModulesFor(modules, specifier));
    }

    if (isTypeofThis(node)) {
      const owner = enclosingClass(node);

      if (owner !== undefined) {
        addReference(node, [owner]);
      }
    }

    for (const child of childrenOf(node, sourceCode)) {
      visit(child);
    }
  };

  visit(program);

  const graph: ReferenceGraph = { edges: mut_edges, targets: mut_targets };

  declarationReferenceGraphCache.set(program, graph);

  return graph;
};

const programOf = (node: TSESTree.Node): TSESTree.Program =>
  node.type === AST_NODE_TYPES.Program ? node : programOf(node.parent);

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
 * the other declarations in the file (`declarationReferenceGraph`) rather than
 * looking for the enclosing name in the element text.
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
 */
const closesDeclarationCycle = (
  tuple: TSESTree.TSTupleType,
  sourceCode: TSESLint.SourceCode,
): boolean => {
  const enclosing = new Set<TSESTree.Node>(enclosingDeclarations(tuple));

  if (enclosing.size === 0) {
    return false;
  }

  // With no scope manager the graph would have no edges, and every cycle would
  // go unseen: a rewrite withheld is the safe side.
  if (sourceCode.scopeManager === null) {
    return true;
  }

  const { edges, targets } = declarationReferenceGraph(
    programOf(tuple),
    sourceCode,
  );

  // A search per tuple, over what its elements reach — at worst the whole
  // graph. It stops at the first cycle, and most reach only a few declarations;
  // strongly connected components computed once per file would bound it, if a
  // file turns out to need it.
  const mut_queue: TSESTree.Node[] = [];

  const collect = (node: TSESTree.Node): void => {
    mut_queue.push(...(targets.get(node) ?? []));

    for (const child of childrenOf(node, sourceCode)) {
      collect(child);
    }
  };

  for (const element of tuple.elementTypes) {
    collect(element);
  }

  const mut_seen = new Set<TSESTree.Node>();

  while (true) {
    const next = mut_queue.pop();

    if (next === undefined) {
      return false;
    }

    if (enclosing.has(next)) {
      return true;
    }

    if (mut_seen.has(next)) {
      continue;
    }

    mut_seen.add(next);

    mut_queue.push(...(edges.get(next) ?? []));
  }
};

const declarationReferenceGraphCache = new WeakMap<
  TSESTree.Program,
  ReferenceGraph
>();

type ReferenceGraph = Readonly<{
  /** The declarations each declaration leads to (`declarationReferenceGraph`). */
  edges: ReadonlyMap<TSESTree.Node, ReadonlySet<TSESTree.Node>>;
  /** The declarations each node that refers leads to. */
  targets: ReadonlyMap<TSESTree.Node, readonly TSESTree.Node[]>;
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
