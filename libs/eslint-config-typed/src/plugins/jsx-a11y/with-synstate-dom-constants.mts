import {
  type TSESLint,
  type TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/utils';
import type { Rule } from 'eslint';
import {
  asNode,
  buildCalleeResolver,
  getImportDeclarations,
  importedNameOf,
  isShadowedCallee,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr, castDeepMutable, hasKey, isRecord, Obj } from 'ts-data-forge';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';

/**
 * The `meta` and `rules` of `plugin`, a plugin module that ships no types, each
 * rule reading an attribute bound to synstate-dom's `constant(x)` as if it were
 * bound to `x` (#3408). Its `configs` name `jsx-a11y/` and are left out.
 *
 * synstate-dom takes every attribute as a `Bindable`, so a fixed value is
 * written `role={constant('button')}`. jsx-a11y reads attribute values through
 * jsx-ast-utils, which takes such a call for the string `"constant('button')"`
 * or for no literal at all, so `aria-role` and `aria-proptypes` would pass wrong
 * values, and `no-static-element-interactions` would report a `div` whose role
 * is given. Each rule is handed, in place of a `JSXAttribute`,
 * `JSXSpreadAttribute`, `JSXOpeningElement`, `JSXElement` or `JSXFragment`, its node in a copy of the
 * JSX tree around it whose attributes bound to `constant(x)` are bound to `x`:
 * the copy's parents and children are copies too, so a rule that reads an
 * element's other attributes or its children's reads them unwrapped, those in
 * an object literal spread (`{...{ role: constant('button') }}`) included. It
 * reports on the copy, which has the original's location. A file that imports
 * neither `constant` nor a namespace from synstate-dom gets the rules
 * unchanged, so React's JSX reads as before.
 *
 * A call is unwrapped when its callee is synstate-dom's `constant`, by any
 * local name or through a namespace import (`dom.constant`, not a computed
 * `dom['constant']`), and not shadowed, and it has one argument that is not
 * spread; the call, its callee and its argument are read through `as`,
 * `satisfies`, `!` and `?.` (`<T>` cannot be written in a file with JSX).
 * A call anywhere in the value is unwrapped too — in a branch or the test of
 * `?:`, either side of `&&`, `||`, `??` or a binary operator, under `!`, in a
 * template literal, an array or an object — because jsx-ast-utils'
 * `getPropValue` evaluates all of those; not in a function or nested JSX, which
 * it does not. An import of types, `import type` or `import { type constant }`,
 * imports no `constant`. An observable is left as it is: its value is not in
 * the source. The tree stops at an expression container, so an element inside
 * `{...}` is a tree of its own, copied when a rule reaches it.
 */
export const withSynstateDomConstants = (
  plugin: unknown,
): Readonly<{
  meta?: PluginMeta;
  rules: ReadonlyRecord<string, Rule.RuleModule>;
}> =>
  ({
    // ESLint names a plugin by its `meta` in a cache key and in the config
    // inspector: the wrapper takes jsx-a11y's version, so that upgrading
    // jsx-a11y invalidates a cache, and a name of its own. A change to the
    // wrapper alone is no more visible to a cache than one to this package's
    // own plugins, which carry no `meta` at all.
    ...metaOf(plugin),
    rules: Object.fromEntries(
      rulesOf(plugin).map(
        ([name, rule]) => [name, unwrappingConstants(rule)] as const,
      ),
    ),
  }) as const;

// The published module alone: synstate-dom-next is a private rebuild that
// replaces synstate-dom under this name at its next major, so a module list
// would only keep a name nothing will publish.
const synstateDom = 'synstate-dom';

/** Nodes whose children jsx-ast-utils' `getPropValue` does not evaluate. */
const opaque: ReadonlySet<string> = new Set<string>([
  AST_NODE_TYPES.ArrowFunctionExpression,
  AST_NODE_TYPES.FunctionExpression,
  AST_NODE_TYPES.ClassExpression,
  AST_NODE_TYPES.JSXElement,
  AST_NODE_TYPES.JSXFragment,
]);

/**
 * The keys under which a node holds a type, which jsx-a11y never evaluates:
 * `x as T`, `f<T>(x)`.
 */
const typeKeys: ReadonlySet<string> = new Set<string>([
  'typeAnnotation',
  'typeArguments',
  'typeParameters',
]);

type PluginMeta = Readonly<{ name?: string; version?: string }>;

type IsConstant = (callee: DeepReadonly<TSESTree.Node>) => boolean;

/** A node as the wrapped rules read it: its copy, or itself. */
type Read = (node: DeepReadonly<TSESTree.Node>) => DeepReadonly<TSESTree.Node>;

/**
 * Per file, keyed by its `Program`, how the wrapped rules read its nodes, built
 * once for every rule; `read` is `undefined` for a file that imports neither
 * `constant` nor a namespace from synstate-dom.
 */
const mut_readers = new WeakMap<
  DeepReadonly<TSESTree.Program>,
  Readonly<{ read: Read | undefined }>
>();

/**
 * `{ meta }` named for the wrapper, with the `version` of `plugin`'s meta, or
 * `{}` when `plugin` has none.
 */
const metaOf = (plugin: unknown): Readonly<{ meta?: PluginMeta }> => {
  if (!isRecord(plugin) || !hasKey(plugin, 'meta') || !isRecord(plugin.meta)) {
    return {};
  }

  const { meta } = plugin;

  return {
    meta: {
      ...(hasKey(meta, 'name') && typeof meta.name === 'string'
        ? { name: `${meta.name} (reading synstate-dom's constant)` }
        : {}),
      ...(hasKey(meta, 'version') && typeof meta.version === 'string'
        ? { version: meta.version }
        : {}),
    },
  };
};

/** The rules of `plugin`, each one that has a `create` function. */
const rulesOf = (
  plugin: unknown,
): readonly (readonly [string, Rule.RuleModule])[] => {
  if (
    !isRecord(plugin) ||
    !hasKey(plugin, 'rules') ||
    !isRecord(plugin.rules)
  ) {
    return [];
  }

  const { rules } = plugin;

  // Not `pluginRule` of ts-restrictions' `suggestion-only.mts`, which takes one
  // rule by name and is internal to that plugin.
  return Arr.generate(function* () {
    for (const [name, rule] of Object.entries(rules)) {
      if (
        isRecord(rule) &&
        hasKey(rule, 'create') &&
        typeof rule.create === 'function'
      ) {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a plugin's rule, which ESLint validates as it runs it
        yield [name, rule as unknown as Rule.RuleModule] as const;
      }
    }
  });
};

/**
 * The outermost `JSXElement` or `JSXFragment` whose tree, not crossing an
 * expression container, holds `node`, when `node` is a JSX element, fragment,
 * opening element, attribute or spread attribute.
 */
const jsxRoot = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.JSXElement | TSESTree.JSXFragment> | undefined => {
  const element =
    node.type === AST_NODE_TYPES.JSXAttribute ||
    node.type === AST_NODE_TYPES.JSXSpreadAttribute
      ? node.parent.parent
      : node.type === AST_NODE_TYPES.JSXOpeningElement
        ? node.parent
        : node;

  if (
    element.type !== AST_NODE_TYPES.JSXElement &&
    element.type !== AST_NODE_TYPES.JSXFragment
  ) {
    return undefined;
  }

  let mut_root: DeepReadonly<TSESTree.JSXElement | TSESTree.JSXFragment> =
    element;

  while (
    mut_root.parent.type === AST_NODE_TYPES.JSXElement ||
    mut_root.parent.type === AST_NODE_TYPES.JSXFragment
  ) {
    mut_root = mut_root.parent;
  }

  return mut_root;
};

/**
 * `node` with the type wrappers and chain expressions around it skipped:
 * `constant?.(x)!` is a call in a non-null expression in a chain expression.
 */
const unwrap = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const inner = skipTypeWrappers(node);

  return inner.type === AST_NODE_TYPES.ChainExpression
    ? unwrap(inner.expression)
    : inner;
};

/** The argument of `node` when it is a call to `constant`. */
const constantArgument = (
  node: DeepReadonly<TSESTree.Node>,
  isConstant: IsConstant,
): DeepReadonly<TSESTree.Node> | undefined => {
  const call = unwrap(node);

  if (call.type !== AST_NODE_TYPES.CallExpression) {
    return undefined;
  }

  const [argument, ...rest] = call.arguments;

  return argument === undefined ||
    argument.type === AST_NODE_TYPES.SpreadElement ||
    Arr.isNonEmpty(rest) ||
    !isConstant(call.callee)
    ? undefined
    : skipTypeWrappers(argument);
};

const isNode = (value: unknown): value is DeepReadonly<TSESTree.Node> =>
  isRecord(value) && hasKey(value, 'type') && typeof value.type === 'string';

/**
 * `declaration` with only its specifiers that can bind `constant` as a value,
 * the namespace and `constant` itself, or none when it has neither: a file that
 * imports only `For` or a type has no call to read.
 */
const constantImports = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- typescript-eslint's node type, as `buildCalleeResolver` takes it
  declaration: TSESTree.ImportDeclaration,
): readonly TSESTree.ImportDeclaration[] => {
  if (declaration.importKind === 'type') {
    return [];
  }

  const specifiers = declaration.specifiers.filter(
    (specifier) =>
      specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier ||
      (specifier.type === AST_NODE_TYPES.ImportSpecifier &&
        specifier.importKind !== 'type' &&
        importedNameOf(specifier) === 'constant'),
  );

  return Arr.isEmpty(specifiers) ? [] : [{ ...declaration, specifiers }];
};

const buildRead = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's source code object, whose type has mutable members
  sourceCode: TSESLint.SourceCode,
): Read | undefined => {
  // A language other than JavaScript (`@eslint/json`, `@eslint/markdown`) hands
  // its own root node, and a config may name such a file for these rules; it
  // has no JSX to read.
  const ast: unknown = sourceCode.ast;

  if (
    !isRecord(ast) ||
    ast['type'] !== AST_NODE_TYPES.Program ||
    !hasKey(ast, 'body') ||
    !Arr.isArray(ast.body)
  ) {
    return undefined;
  }

  // Only an import from 'synstate-dom' itself counts: a `constant` re-exported
  // by another module is not followed, since that would need the other file,
  // and a rule reads one.
  const declarations = getImportDeclarations(
    sourceCode.ast,
    synstateDom,
  ).flatMap(constantImports);

  if (Arr.isEmpty(declarations)) {
    return undefined;
  }

  const resolve = buildCalleeResolver(declarations);

  const isConstant: IsConstant = (callee) => {
    // `(dom?.constant)(x)`: the resolver reads through type wrappers, not chains.
    const resolved = resolve(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a callee, an expression, with its wrappers skipped is one too
      castDeepMutable(unwrap(callee)) as TSESTree.Expression,
    );

    return (
      resolved?.canonicalName === 'constant' &&
      !isShadowedCallee(sourceCode, resolved, synstateDom)
    );
  };

  /**
   * `node` with each `constant(x)` in it read as `x`, or `undefined` when it
   * holds none: the children ESLint's visitor keys name, down to a function or
   * nested JSX ({@link opaque}). Only the nodes on the way to a replaced call
   * are copied.
   */
  const unwrapped = (
    node: DeepReadonly<TSESTree.Node>,
  ): TSESTree.Node | undefined => {
    const argument = constantArgument(node, isConstant);

    if (argument !== undefined) {
      return unwrapped(argument) ?? asNode(argument);
    }

    if (opaque.has(node.type)) {
      return undefined;
    }

    const changed = (sourceCode.visitorKeys[node.type] ?? [])
      .filter((key) => !typeKeys.has(key))
      .flatMap((key): readonly (readonly [string, unknown])[] => {
        const value: unknown = hasKey(node, key) ? node[key] : undefined;

        if (isNode(value)) {
          const replaced = unwrapped(value);

          return replaced === undefined ? [] : [[key, replaced]];
        }

        if (!Arr.isArray(value)) {
          return [];
        }

        const items: readonly unknown[] = value;

        const replacedItems = items.map((item) =>
          isNode(item) ? unwrapped(item) : undefined,
        );

        return replacedItems.every((item) => item === undefined)
          ? []
          : [[key, items.map((item, i) => replacedItems[i] ?? item)]];
      });

    return Arr.isEmpty(changed)
      ? undefined
      : {
          ...asNode(node),
          ...Object.fromEntries(changed),
        };
  };

  // Every tree a rule reaches is copied whole, once per file, whether or not it
  // holds a `constant` call: a scan to skip one would walk the tree too, and a
  // copy is shallow, one object per element and attribute.
  /**
   * Each node of the JSX trees copied so far, mapped to its copy. The copies
   * are built mutable, so that each can point at the copies around it.
   */
  const mut_copies = new WeakMap<DeepReadonly<TSESTree.Node>, TSESTree.Node>();

  const copyAttribute = (
    node: DeepReadonly<TSESTree.JSXAttribute>,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the copy this one hangs from, written as it is built
    parent: TSESTree.JSXOpeningElement,
  ): TSESTree.JSXAttribute => {
    const mut_copy = { ...asNode<TSESTree.JSXAttribute>(node), parent };

    mut_copies.set(node, mut_copy);

    if (
      node.value?.type === AST_NODE_TYPES.JSXExpressionContainer &&
      // The parser rejects an empty attribute value (`role={}`); this only
      // narrows the type.
      node.value.expression.type !== AST_NODE_TYPES.JSXEmptyExpression
    ) {
      const expression = unwrapped(node.value.expression);

      if (expression !== undefined) {
        mut_copy.value = {
          ...asNode<TSESTree.JSXExpressionContainer>(node.value),
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- an expression whose `constant` calls are replaced by their arguments, expressions too
          expression: expression as TSESTree.Expression,
          parent: mut_copy,
        };
      }
    }

    return mut_copy;
  };

  // jsx-ast-utils' `getProp` reads the properties of an object literal spread
  // (`{...{ role: 'button' }}`) as attributes.
  const copySpreadAttribute = (
    node: DeepReadonly<TSESTree.JSXSpreadAttribute>,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the copy this one hangs from, written as it is built
    parent: TSESTree.JSXOpeningElement,
  ): TSESTree.JSXSpreadAttribute => {
    const argument = unwrapped(node.argument);

    const copy = {
      ...asNode<TSESTree.JSXSpreadAttribute>(node),
      ...(argument === undefined
        ? {}
        : {
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- an expression whose `constant` calls are replaced by their arguments, expressions too
            argument: argument as TSESTree.Expression,
          }),
      parent,
    } as const;

    mut_copies.set(node, copy);

    return copy;
  };

  const copyOpeningElement = (
    node: DeepReadonly<TSESTree.JSXOpeningElement>,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the copy this one hangs from, written as it is built
    parent: TSESTree.JSXElement,
  ): TSESTree.JSXOpeningElement => {
    const mut_copy = {
      ...asNode<TSESTree.JSXOpeningElement>(node),
      parent,
    };

    mut_copies.set(node, mut_copy);

    mut_copy.attributes = node.attributes.map((attribute) =>
      attribute.type === AST_NODE_TYPES.JSXAttribute
        ? copyAttribute(attribute, mut_copy)
        : copySpreadAttribute(attribute, mut_copy),
    );

    return mut_copy;
  };

  // An expression container is kept as it is, elements inside it included:
  // jsx-a11y takes a child in `{...}` for content it cannot read
  // (`hasAccessibleChild`, `mayContainChildComponent`) and does not look in it.
  // An element in it is a tree of its own whose ancestors are the originals: no
  // jsx-a11y rule reads past the element around an attribute or a child.
  // What holds no attribute to read is kept as the original, its `parent` the
  // original too: a closing element, text. No
  // jsx-a11y rule visits one of those or walks up from it.
  /** A copy of `node`, a child of `parent`, when it is an element or fragment. */
  const copyChild = (
    node: DeepReadonly<TSESTree.JSXChild>,
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the copy this one hangs from, written as it is built
    parent: TSESTree.Node,
  ): TSESTree.JSXChild => {
    if (node.type === AST_NODE_TYPES.JSXElement) {
      const mut_copy = { ...asNode<TSESTree.JSXElement>(node), parent };

      mut_copies.set(node, mut_copy);

      mut_copy.openingElement = copyOpeningElement(
        node.openingElement,
        mut_copy,
      );

      mut_copy.children = node.children.map((child) =>
        copyChild(child, mut_copy),
      );

      return mut_copy;
    }

    if (node.type === AST_NODE_TYPES.JSXFragment) {
      const mut_copy = { ...asNode<TSESTree.JSXFragment>(node), parent };

      mut_copies.set(node, mut_copy);

      mut_copy.children = node.children.map((child) =>
        copyChild(child, mut_copy),
      );

      return mut_copy;
    }

    return asNode<TSESTree.JSXChild>(node);
  };

  return (node) => {
    const copied = mut_copies.get(node);

    if (copied !== undefined) {
      return copied;
    }

    const root = jsxRoot(node);

    if (root === undefined) {
      return node;
    }

    copyChild(root, asNode<TSESTree.Node>(root.parent));

    return mut_copies.get(node) ?? node;
  };
};

const readerOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's source code object, whose type has mutable members
  sourceCode: TSESLint.SourceCode,
): Read | undefined => {
  const cached = mut_readers.get(sourceCode.ast);

  if (cached !== undefined) {
    return cached.read;
  }

  const read = buildRead(sourceCode);

  mut_readers.set(sourceCode.ast, { read });

  return read;
};

/**
 * `context`, its reports made without a fix or a suggestion: either would be
 * built from the copy, whose argument stands where the call's range is, and
 * would write the argument over the call. jsx-a11y offers neither today; a
 * later 6.x a consumer resolves may.
 */
const withoutFixes = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's context type, which has mutable members
  context: Rule.RuleContext,
): Rule.RuleContext =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the context itself, its `report` alone replaced
  Object.create(context, {
    // Every report in such a file loses them, not only one on a copy: jsx-a11y
    // offers none, and a report's node may be any node of a copied tree, whose
    // new nodes carry no mark.
    report: {
      value: (...args: readonly unknown[]): void => {
        const [descriptor] = args;

        if (Arr.isFixedLengthArray(1, args) && isRecord(descriptor)) {
          context.report({
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the descriptor the rule passed, which ESLint validates
            ...(descriptor as unknown as Rule.ReportDescriptor),
            fix: null,
            suggest: null,
          });

          return;
        }

        // The positional form ESLint still takes, `report(node, message, data,
        // fix)` or `report(node, loc, message, data, fix)`: the fix is cut off.
        context.report(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the positional arguments, which ESLint's types no longer name
          ...(args.slice(
            0,
            typeof args[1] === 'string' ? 3 : 4,
          ) as unknown as readonly [Rule.ReportDescriptor]),
        );
      },
    },
  }) as Rule.RuleContext;

/**
 * `rule`, its visitors handed nodes with `constant(x)` read as `x`. A visitor's
 * first argument is read, the node of every JSX listener; a listener given its
 * node later, a code path event, reads the original, and jsx-a11y has none.
 */
const unwrappingConstants = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- ESLint's rule type, which has mutable members
  rule: Rule.RuleModule,
): Rule.RuleModule =>
  ({
    ...rule,
    create: (context) => {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- ESLint's and typescript-eslint's types of one source code object
      const sourceCode = context.sourceCode as unknown as TSESLint.SourceCode;

      const read = readerOf(sourceCode);

      if (read === undefined) {
        return rule.create(context);
      }

      const visitors = rule.create(withoutFixes(context));

      const readNode = (node: unknown): unknown =>
        isRecord(node) && hasKey(node, 'type')
          ? read(
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- an ESTree node ESLint hands a visitor
              node as unknown as DeepReadonly<TSESTree.Node>,
            )
          : node;

      return Obj.map(visitors, (visit) =>
        typeof visit === 'function'
          ? (node: unknown, ...rest: readonly unknown[]): unknown =>
              // `Reflect.apply`, because a call to the union of the listener
              // types would take only `never`; the one array it costs per visit
              // is small beside what the rule does with the node.
              Reflect.apply(
                visit,
                undefined,
                Arr.toUnshifted(readNode(node))(rest),
              )
          : visit,
      );
    },
  }) as const;
