import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  hasForeignBinding,
  isTypeWrapper,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'writeDuringPropagation';

/**
 * A subscriber or a projection that writes to a root starts an update while
 * the one that called it is still propagating. The write is not an edge of
 * the graph, so synstate cannot order it: subscribers see intermediate
 * states, a node can emit twice for one write, and a write back into the
 * update that called it loops. synstate warns at run time, once per root;
 * this rule says so where the write is written.
 *
 * Only the syntax is read. A write is a call to what a synstate factory
 * returned in this file (`createState`'s setter, `createReducer`'s
 * `dispatch`, `source()`'s `next`, …), made directly in a function passed to
 * `.subscribe(…)` or to an operator in `.pipe(…)`. A write in a function the
 * callback only defines (a `setTimeout` callback) runs later and is not
 * reported, and neither is one through a setter imported from another file.
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

    return {
      CallExpression: (node) => {
        if (isWrite(node) && runsDuringPropagation(node)) {
          context.report({ node, messageId: 'writeDuringPropagation' });
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
 * Whether `call` runs while an update propagates: directly in a function
 * passed to `.subscribe(…)`, or to a call that is an argument of `.pipe(…)`
 * (an operator's projection). A nested function is assumed to run later.
 */
const runsDuringPropagation = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  call: TSESTree.CallExpression,
): boolean => {
  const fn = enclosingFunctionOf(call);

  if (fn === undefined) {
    return false;
  }

  const caller = callTakingAsArgument(fn);

  if (caller === undefined) {
    return false;
  }

  const callee = skipTypeWrappers(caller.callee);

  if (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    isPropertyNamed(callee, 'subscribe')
  ) {
    return true;
  }

  const pipe = callTakingAsArgument(caller);

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

const enclosingFunctionOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): FunctionNode | undefined => {
  // The program's `parent` is `null` at run time, whatever its type says.
  if (node.type === AST_NODE_TYPES.Program) {
    return undefined;
  }

  const parent = node.parent;

  return parent.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    parent.type === AST_NODE_TYPES.FunctionDeclaration ||
    parent.type === AST_NODE_TYPES.FunctionExpression
    ? parent
    : enclosingFunctionOf(parent);
};

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
