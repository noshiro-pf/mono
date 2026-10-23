import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  hasForeignBinding,
  isTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import * as ts from 'typescript';
import { SYNSTATE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'writeDuringPropagation' | 'writeThroughCall';

/**
 * A subscriber or a projection that writes to a root starts an update while
 * the one that called it is still propagating. The write is not an edge of
 * the graph, so synstate cannot order it: subscribers see intermediate
 * states, a node can emit twice for one write, and a write back into the
 * update that called it loops. synstate warns at run time, once per root;
 * this rule says so where the write is written.
 *
 * A write is a call to what a synstate factory returned (`createState`'s
 * setter, `createReducer`'s `dispatch`, `source()`'s `next`, …), made
 * directly in a function passed to `.subscribe(…)` or to an operator in
 * `.pipe(…)`. A function passed by name counts when this file defines it, and
 * so does a write in a function of this file the callback calls, at any
 * depth, reported at the call. A write in a function the callback only
 * defines (a `setTimeout` callback) runs later and is not reported.
 *
 * The factory call is read in this file. With type information, a setter
 * imported from another file is followed to the declaration it was exported
 * from, and that file's factory call is read the same way; without it, an
 * imported setter is not judged. Nothing here builds a program: the cost is
 * a symbol lookup per call in a callback, on a program the parser has
 * already made.
 */
export const noWriteDuringPropagation: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow writing to a synstate state or source from a subscriber or a projection, while the update that called it is propagating.',
    },
    schema: [],
    messages: {
      writeDuringPropagation:
        'This writes to a synstate state from a subscriber or a projection, while the update that called it is still propagating. The write is not part of the graph, so subscribers can see intermediate states, and a write back into the same update loops. Derive the value with `pipe` (`map`, `combine`, …) instead.',
      writeThroughCall:
        'This calls `{{name}}`, which writes to a synstate state, from a subscriber or a projection, while the update that called it is still propagating. The write is not part of the graph, so subscribers can see intermediate states, and a write back into the same update loops. Derive the value with `pipe` (`map`, `combine`, …) instead.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const resolveCallee = buildCalleeResolver(
      getImportDeclarations(sourceCode.ast, SYNSTATE_MODULE),
    );

    const isSynstateCall = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      call: TSESTree.CallExpression,
    ): string | undefined => {
      const resolved = resolveCallee(call.callee);

      if (resolved === undefined) {
        return undefined;
      }

      const boundName = boundIdentifierOf(call.callee);

      return boundName === undefined ||
        hasForeignBinding(
          sourceCode,
          boundName,
          boundName.name,
          SYNSTATE_MODULE,
        )
        ? undefined
        : resolved.canonicalName;
    };

    /** The synstate factory whose result `identifier` was bound from, and where in it. */
    const factoryBindingOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      identifier: TSESTree.Identifier,
    ): Readonly<{ factory: string; path: readonly PathStep[] }> | undefined => {
      const variable = ASTUtils.findVariable(
        sourceCode.getScope(identifier),
        identifier.name,
      );

      // One definition: a name declared again with `var` is not judged.
      const def = variable?.defs.length === 1 ? variable.defs[0] : undefined;

      if (def?.type === TSESLint.Scope.DefinitionType.ImportBinding) {
        return importedFactoryBindingOf(identifier);
      }

      if (
        def?.node.type !== AST_NODE_TYPES.VariableDeclarator ||
        def.node.init === null
      ) {
        return undefined;
      }

      const init = skipTypeWrappers(def.node.init);

      if (init.type !== AST_NODE_TYPES.CallExpression) {
        return undefined;
      }

      const factory = isSynstateCall(init);

      const path = pathTo(def.name, def.node.id);

      return factory === undefined || path === undefined
        ? undefined
        : { factory, path };
    };

    /**
     * Where an imported `identifier` was bound from a synstate factory, read
     * in the file that exports it. `undefined` without type information.
     */
    const importedFactoryBindingOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      identifier: TSESTree.Identifier,
    ): Readonly<{ factory: string; path: readonly PathStep[] }> | undefined => {
      const services = sourceCode.parserServices;

      const checker = services?.program?.getTypeChecker();

      const tsNode = services?.esTreeNodeToTSNodeMap?.get(identifier);

      if (checker === undefined || tsNode === undefined) {
        return undefined;
      }

      const symbol = checker.getSymbolAtLocation(tsNode);

      if (symbol === undefined || (symbol.flags & ts.SymbolFlags.Alias) === 0) {
        return undefined;
      }

      const declaration = checker.getAliasedSymbol(symbol).valueDeclaration;

      return declaration === undefined
        ? undefined
        : tsFactoryBindingOf(checker, declaration);
    };

    /** The function of this file that `expression` names, if any. */
    const localFunctionOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      expression: TSESTree.Node,
    ): FunctionNode | undefined => {
      const node = skipTypeWrappers(expression);

      if (isFunctionNode(node)) {
        return node;
      }

      if (node.type !== AST_NODE_TYPES.Identifier) {
        return undefined;
      }

      const variable = ASTUtils.findVariable(
        sourceCode.getScope(node),
        node.name,
      );

      const def = variable?.defs.length === 1 ? variable.defs[0] : undefined;

      if (def?.type === TSESLint.Scope.DefinitionType.FunctionName) {
        return def.node.type === AST_NODE_TYPES.FunctionDeclaration
          ? def.node
          : undefined;
      }

      // A `const`, so that the name stays the function it was given.
      if (
        def?.type !== TSESLint.Scope.DefinitionType.Variable ||
        def.parent.kind !== 'const' ||
        def.node.id !== def.name ||
        def.node.init === null
      ) {
        return undefined;
      }

      const init = skipTypeWrappers(def.node.init);

      return isFunctionNode(init) ? init : undefined;
    };

    const isWrite = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      call: TSESTree.CallExpression,
    ): boolean => {
      const callee = skipTypeWrappers(call.callee);

      if (callee.type === AST_NODE_TYPES.Identifier) {
        const setter = factoryBindingOf(callee);

        return (
          setter !== undefined &&
          writersOf(setter.factory).some((writer) =>
            samePath(writer, setter.path),
          )
        );
      }

      if (
        callee.type !== AST_NODE_TYPES.MemberExpression ||
        !isPropertyNamed(callee, 'next')
      ) {
        return false;
      }

      const object = skipTypeWrappers(callee.object);

      if (object.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      const binding = factoryBindingOf(object);

      return binding?.factory === 'source' && binding.path.length === 0;
    };

    /** The calls made directly in each function, outside nested ones. */
    const mut_callsIn = new Map<FunctionNode, TSESTree.CallExpression[]>();

    /** The functions that run while an update propagates. */
    const mut_callbacks = new Set<FunctionNode>();

    /** Whether a function of this file writes, itself or through a call. */
    const mut_writes = new Map<FunctionNode, boolean>();

    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    const writes = (fn: FunctionNode): boolean => {
      const known = mut_writes.get(fn);

      if (known !== undefined) {
        return known;
      }

      // A recursive call adds nothing to what the function does.
      mut_writes.set(fn, false);

      const result = (mut_callsIn.get(fn) ?? []).some((call) => {
        if (isWrite(call)) {
          return true;
        }

        const callee = localFunctionOf(call.callee);

        return callee !== undefined && writes(callee);
      });

      mut_writes.set(fn, result);

      return result;
    };

    return {
      CallExpression: (node) => {
        const fn = enclosingFunctionOf(node);

        if (fn !== undefined) {
          const mut_calls = mut_callsIn.get(fn);

          if (mut_calls === undefined) {
            mut_callsIn.set(fn, [node]);
          } else {
            mut_calls.push(node);
          }
        }

        if (callsBackDuringPropagation(node)) {
          for (const argument of node.arguments) {
            const callback = localFunctionOf(argument);

            if (callback !== undefined) {
              mut_callbacks.add(callback);
            }
          }
        }
      },

      'Program:exit': () => {
        for (const callback of mut_callbacks) {
          for (const call of mut_callsIn.get(callback) ?? []) {
            if (isWrite(call)) {
              context.report({
                node: call,
                messageId: 'writeDuringPropagation',
              });

              continue;
            }

            const callee = localFunctionOf(call.callee);

            if (callee !== undefined && writes(callee)) {
              context.report({
                node: call,
                messageId: 'writeThroughCall',
                data: { name: sourceCode.getText(call.callee) },
              });
            }
          }
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/** An element of an array pattern by index, or a property of an object pattern by key. */
type PathStep = number | string;

/**
 * What each synstate factory returns that writes, by its place in the
 * result: `createState`'s `[state$, setState, { updateState, resetState }]`
 * and so on. `source()` writes through its `next` method instead.
 */
const writersOf = (factory: string): readonly (readonly PathStep[])[] => {
  switch (factory) {
    case 'createState':
      return [[1], [2, 'updateState'], [2, 'resetState']];

    case 'createReducer':
    case 'createEventEmitter':
    case 'createValueEmitter':
      return [[1]];

    case 'createBooleanState':
      return [
        [1, 'setTrue'],
        [1, 'setFalse'],
        [1, 'setState'],
        [1, 'toggle'],
        [1, 'updateState'],
        [1, 'resetState'],
      ];

    default:
      return [];
  }
};

const samePath = (a: readonly PathStep[], b: readonly PathStep[]): boolean =>
  a.length === b.length && a.every((step, index) => step === b[index]);

/**
 * The steps from the pattern `root` down to `name`: array indices and object
 * keys, through defaults. `undefined` when the way down cannot be read (a
 * rest element, a computed key).
 */
const pathTo = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  name: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  root: TSESTree.Node,
): readonly PathStep[] | undefined => {
  if (name === root) {
    return [];
  }

  const parent = name.parent;

  if (parent === undefined) {
    return undefined;
  }

  if (parent.type === AST_NODE_TYPES.AssignmentPattern) {
    return parent.left === name ? pathTo(parent, root) : undefined;
  }

  if (parent.type === AST_NODE_TYPES.ArrayPattern) {
    const index = parent.elements.indexOf(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      name as TSESTree.DestructuringPattern,
    );

    const above = pathTo(parent, root);

    return index === -1 || above === undefined ? undefined : [...above, index];
  }

  if (parent.type === AST_NODE_TYPES.Property) {
    const key = parent.computed ? undefined : keyName(parent.key);

    const pattern = parent.parent;

    const above =
      pattern.type === AST_NODE_TYPES.ObjectPattern
        ? pathTo(pattern, root)
        : undefined;

    return key === undefined || above === undefined || parent.value !== name
      ? undefined
      : [...above, key];
  }

  return undefined;
};

const keyName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  key: TSESTree.PropertyName,
): string | undefined =>
  key.type === AST_NODE_TYPES.Identifier
    ? key.name
    : key.type === AST_NODE_TYPES.Literal && typeof key.value === 'string'
      ? key.value
      : undefined;

/**
 * Whether the functions passed to `call` run while an update propagates:
 * `call` is `.subscribe(…)`, or an operator called as an argument of
 * `.pipe(…)`, whose functions are projections.
 */
const callsBackDuringPropagation = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  call: TSESTree.CallExpression,
): boolean => {
  const callee = skipTypeWrappers(call.callee);

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    isPropertyNamed(callee, 'subscribe')
  ) {
    return true;
  }

  const pipe = callTakingAsArgument(call);

  if (pipe === undefined) {
    return false;
  }

  const pipeCallee = skipTypeWrappers(pipe.callee);

  return (
    pipeCallee.type === AST_NODE_TYPES.MemberExpression &&
    isPropertyNamed(pipeCallee, 'pipe')
  );
};

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

const isFunctionNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): node is FunctionNode =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionDeclaration ||
  node.type === AST_NODE_TYPES.FunctionExpression;

const enclosingFunctionOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): FunctionNode | undefined => {
  // The program's `parent` is `null` at run time, whatever its type says.
  if (node.type === AST_NODE_TYPES.Program) {
    return undefined;
  }

  const parent = node.parent;

  return isFunctionNode(parent) ? parent : enclosingFunctionOf(parent);
};

/**
 * The synstate factory whose result a TypeScript `declaration` was bound
 * from, and where in it: `export const [a$, setA] = createState(0)` gives
 * `setA` the factory `createState` and the path `[1]`. The factory is
 * recognized by the import of the declaration's own file.
 */
const tsFactoryBindingOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  declaration: ts.Declaration,
): Readonly<{ factory: string; path: readonly PathStep[] }> | undefined => {
  const binding = tsPathTo(declaration);

  if (binding === undefined) {
    return undefined;
  }

  const init = binding.variable.initializer;

  const call = init === undefined ? undefined : skipTsTypeWrappers(init);

  if (call === undefined || !ts.isCallExpression(call)) {
    return undefined;
  }

  const factory = tsSynstateExportOf(checker, call.expression);

  return factory === undefined ? undefined : { factory, path: binding.path };
};

/**
 * The variable declaration a TypeScript binding is part of, and the steps
 * from its name down to the binding (see {@link pathTo}).
 */
const tsPathTo = (
  node: ts.Node,
):
  | Readonly<{ variable: ts.VariableDeclaration; path: readonly PathStep[] }>
  | undefined => {
  if (ts.isVariableDeclaration(node)) {
    return { variable: node, path: [] };
  }

  if (!ts.isBindingElement(node)) {
    return undefined;
  }

  const pattern = node.parent;

  const above = tsPathTo(pattern.parent);

  if (above === undefined) {
    return undefined;
  }

  if (ts.isArrayBindingPattern(pattern)) {
    return {
      variable: above.variable,
      path: [...above.path, pattern.elements.indexOf(node)],
    };
  }

  const key = node.propertyName ?? node.name;

  return ts.isIdentifier(key) || ts.isStringLiteral(key)
    ? { variable: above.variable, path: [...above.path, key.text] }
    : undefined;
};

/**
 * The name `callee` has among synstate's exports, when the file it is in
 * imports it from synstate: by name, under an alias, or through a namespace.
 */
const tsSynstateExportOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: ts.Expression,
): string | undefined => {
  const callee = skipTsTypeWrappers(expression);

  if (ts.isIdentifier(callee)) {
    const specifier = checker.getSymbolAtLocation(callee)?.declarations?.[0];

    return specifier !== undefined &&
      ts.isImportSpecifier(specifier) &&
      isSynstateImport(specifier.parent.parent.parent)
      ? (specifier.propertyName ?? specifier.name).text
      : undefined;
  }

  if (
    !ts.isPropertyAccessExpression(callee) ||
    !ts.isIdentifier(callee.expression)
  ) {
    return undefined;
  }

  const declaration = checker.getSymbolAtLocation(callee.expression)
    ?.declarations?.[0];

  return declaration !== undefined &&
    ts.isNamespaceImport(declaration) &&
    isSynstateImport(declaration.parent.parent)
    ? callee.name.text
    : undefined;
};

const isSynstateImport = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  declaration: ts.ImportDeclaration | ts.JSDocImportTag,
): boolean =>
  ts.isImportDeclaration(declaration) &&
  ts.isStringLiteral(declaration.moduleSpecifier) &&
  declaration.moduleSpecifier.text === SYNSTATE_MODULE;

/** `as`, `satisfies`, `!`, `<T>` and parentheses, in the TypeScript tree. */
const skipTsTypeWrappers = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: ts.Expression,
): ts.Expression =>
  ts.isParenthesizedExpression(expression) ||
  ts.isAsExpression(expression) ||
  ts.isSatisfiesExpression(expression) ||
  ts.isNonNullExpression(expression) ||
  ts.isTypeAssertionExpression(expression)
    ? skipTsTypeWrappers(expression.expression)
    : expression;

/**
 * The call that `node` is an argument of, through the type wrappers around
 * `node`, or `undefined`.
 */
const callTakingAsArgument = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): TSESTree.CallExpression | undefined => {
  const parent = node.parent;

  if (parent === undefined) {
    return undefined;
  }

  if (isTypeWrapper(parent)) {
    return callTakingAsArgument(parent);
  }

  // A function or a call under a call is its callee or one of its arguments.
  return parent.type === AST_NODE_TYPES.CallExpression && parent.callee !== node
    ? parent
    : undefined;
};

/** `x.name` or `x['name']`. */
const isPropertyNamed = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  member: TSESTree.MemberExpression,
  name: string,
): boolean =>
  member.computed
    ? member.property.type === AST_NODE_TYPES.Literal &&
      member.property.value === name
    : member.property.type === AST_NODE_TYPES.Identifier &&
      member.property.name === name;

/**
 * The identifier whose binding decides what `callee` calls: the callee itself
 * for a named import, the namespace object for `m.createState`.
 */
const boundIdentifierOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
): TSESTree.Identifier | undefined => {
  const unwrapped = skipTypeWrappers(callee);

  if (unwrapped.type === AST_NODE_TYPES.Identifier) {
    return unwrapped;
  }

  if (unwrapped.type !== AST_NODE_TYPES.MemberExpression) {
    return undefined;
  }

  const object = skipTypeWrappers(unwrapped.object);

  return object.type === AST_NODE_TYPES.Identifier ? object : undefined;
};
