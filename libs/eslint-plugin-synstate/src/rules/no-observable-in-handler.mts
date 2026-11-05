import {
  AST_NODE_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  isLocallyBound,
  isShadowedCallee,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { SYNSTATE_AND_WRAPPER_MODULES } from './constants.mjs';
import { mayStopByItself } from './counter-options.mjs';
import {
  callTakingAsArgument,
  isFunctionNode,
  isPropertyNamed,
  localFunctionOf,
  type FunctionNode,
} from './functions.mjs';

type Options = readonly [];

type MessageIds = 'observableInHandler';

/**
 * An event handler runs outside every scope: by the time it is called, no `run`
 * is executing. An observable it derives belongs to no scope, so it is not
 * disposed with the row or branch it was made for, and its parents keep
 * computing it. synstate-dom's documentation once promised a development-build
 * warning for this; a lint rule catches the same synchronous case with no
 * runtime cost.
 *
 * Only observables that keep working while they live are reported: a root
 * state, `just(…)` or a `timer` computes nothing more, or completes by itself,
 * and is collected once nothing refers to it.
 */
export const noObservableInHandler: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow deriving a synstate observable in an event handler, where it belongs to no scope and is never disposed.',
    },
    schema: [],
    messages: {
      observableInHandler:
        'This observable is created in an event handler, which runs outside every scope, so it belongs to none and keeps being computed after the row or branch it was made for is gone. Have the handler write to a state and derive from that state at mount time, or take the scope with `getCurrentScope()` at mount time and create the observable inside its `run`.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const resolveSynstate = buildCalleeResolver(
      SYNSTATE_AND_WRAPPER_MODULES.flatMap((moduleName) =>
        getImportDeclarations(sourceCode.ast, moduleName),
      ),
    );

    const resolveDom = buildCalleeResolver(
      getImportDeclarations(sourceCode.ast, SYNSTATE_DOM_MODULE),
    );

    const synstateExportOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      callee: TSESTree.Expression,
    ): string | undefined => {
      const resolved = resolveSynstate(callee);

      return resolved === undefined ||
        isShadowedCallee(sourceCode, resolved, SYNSTATE_AND_WRAPPER_MODULES)
        ? undefined
        : resolved.canonicalName;
    };

    const domExportOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      callee: TSESTree.Expression,
    ): string | undefined => {
      const resolved = resolveDom(callee);

      return resolved === undefined ||
        isShadowedCallee(sourceCode, resolved, SYNSTATE_DOM_MODULE)
        ? undefined
        : resolved.canonicalName;
    };

    const mut_handlers = new Set<FunctionNode>();

    const mut_creations = new Set<TSESTree.CallExpression>();

    /** Calls of a function of this file, which a handler may reach. */
    const mut_localCalls: (readonly [TSESTree.CallExpression, FunctionNode])[] =
      [];

    const addHandler = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      expression: TSESTree.Node | undefined,
    ): void => {
      if (expression === undefined) {
        return;
      }

      const node = skipTypeWrappers(expression);

      // `cond ? handler : undefined`, `enabled && handler`
      if (node.type === AST_NODE_TYPES.ConditionalExpression) {
        addHandler(node.consequent);

        addHandler(node.alternate);

        return;
      }

      if (node.type === AST_NODE_TYPES.LogicalExpression) {
        addHandler(node.left);

        addHandler(node.right);

        return;
      }

      const handler = localFunctionOf(sourceCode, node);

      if (handler !== undefined) {
        mut_handlers.add(handler);
      }
    };

    /**
     * Whether the parent passed to `createScope` is none: nothing, `undefined`,
     * `null`, `void …`, or `getCurrentScope()`, which is `undefined` in a
     * handler.
     */
    const isNoParent = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      arg: TSESTree.CallExpressionArgument | undefined,
    ): boolean => {
      if (arg === undefined) {
        return true;
      }

      const parent = skipTypeWrappers(arg);

      return (
        (parent.type === AST_NODE_TYPES.Identifier &&
          parent.name === 'undefined') ||
        (parent.type === AST_NODE_TYPES.Literal && parent.raw === 'null') ||
        (parent.type === AST_NODE_TYPES.UnaryExpression &&
          parent.operator === 'void') ||
        (parent.type === AST_NODE_TYPES.CallExpression &&
          synstateExportOf(parent.callee) === 'getCurrentScope')
      );
    };

    /**
     * Whether `call` runs its argument `fn` in a scope chosen for it: the
     * callback of `scope.run(…)` (any but the `run` of a scope made on the spot
     * with no parent, which nothing disposes), the body of synstate's
     * `untracked(…)`, which puts it in no scope on purpose, or the app that
     * synstate-dom's `render(…)` mounts in a root scope.
     */
    const runsInChosenScope = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      call: TSESTree.CallExpression,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      fn: FunctionNode,
    ): boolean => {
      if (synstateExportOf(call.callee) === 'untracked') {
        return true;
      }

      if (domExportOf(call.callee) === 'render') {
        return (
          call.arguments[0] !== undefined &&
          skipTypeWrappers(call.arguments[0]) === fn
        );
      }

      const callee = skipTypeWrappers(call.callee);

      if (
        callee.type !== AST_NODE_TYPES.MemberExpression ||
        !isPropertyNamed(callee, 'run')
      ) {
        return false;
      }

      const receiver = skipTypeWrappers(callee.object);

      return !(
        receiver.type === AST_NODE_TYPES.CallExpression &&
        synstateExportOf(receiver.callee) === 'createScope' &&
        isNoParent(receiver.arguments[0])
      );
    };

    /**
     * Where `node` runs: `'handler'` in a handler, outside any scope chosen
     * between them, `'nested'` in the arguments of a creation that is itself in
     * a handler, so that the outer one alone is reported, and `'outside'`
     * otherwise.
     */
    const placeOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.Node,
    ): 'handler' | 'nested' | 'outside' => {
      // The program's `parent` is `null` at run time, whatever its type says.
      if (node.type === AST_NODE_TYPES.Program) {
        return 'outside';
      }

      const parent = node.parent;

      if (
        parent.type === AST_NODE_TYPES.CallExpression &&
        mut_creations.has(parent)
      ) {
        return placeOf(parent) === 'handler' ? 'nested' : 'outside';
      }

      if (isFunctionNode(parent)) {
        if (mut_handlers.has(parent)) {
          return 'handler';
        }

        const call = callTakingAsArgument(parent);

        if (call !== undefined && runsInChosenScope(call, parent)) {
          return 'outside';
        }
      }

      return placeOf(parent);
    };

    /**
     * Whether `arg` of a `.pipe` is a synstate operator: a call of a synstate
     * export, written there or bound to a `const` of this file.
     */
    const isSynstateOperator = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      arg: TSESTree.CallExpressionArgument,
    ): boolean => {
      const operator = skipTypeWrappers(arg);

      if (operator.type === AST_NODE_TYPES.CallExpression) {
        return synstateExportOf(operator.callee) !== undefined;
      }

      if (operator.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      const variable = ASTUtils.findVariable(
        sourceCode.getScope(operator),
        operator.name,
      );

      const def = variable?.defs.length === 1 ? variable.defs[0] : undefined;

      if (
        def?.node.type !== AST_NODE_TYPES.VariableDeclarator ||
        def.parent?.type !== AST_NODE_TYPES.VariableDeclaration ||
        def.parent.kind !== 'const' ||
        def.node.init === null
      ) {
        return false;
      }

      const init = skipTypeWrappers(def.node.init);

      return (
        init.type === AST_NODE_TYPES.CallExpression &&
        synstateExportOf(init.callee) !== undefined
      );
    };

    const createsObservable = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      call: TSESTree.CallExpression,
      domName: string | undefined,
    ): boolean => {
      const synstateName = synstateExportOf(call.callee);

      if (synstateName !== undefined) {
        return synstateName === 'counter'
          ? !mayStopByItself(call.arguments)
          : SYNSTATE_LASTING_FACTORIES.has(synstateName);
      }

      if (domName !== undefined) {
        return DOM_DERIVING_FACTORIES.has(domName);
      }

      const callee = skipTypeWrappers(call.callee);

      return (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        isPropertyNamed(callee, 'pipe') &&
        call.arguments.some(isSynstateOperator)
      );
    };

    /**
     * Adds to the handlers every function of this file that a handler calls by
     * name, outside a chosen scope, until no more are added. A call in the
     * arguments of a creation is left to that creation's report.
     */
    const addReachedFunctions = (): void => {
      let mut_added = true;

      while (mut_added) {
        mut_added = false;

        for (const [call, fn] of mut_localCalls) {
          if (mut_handlers.has(fn) || placeOf(call) !== 'handler') {
            continue;
          }

          mut_handlers.add(fn);

          mut_added = true;
        }
      }
    };

    return {
      JSXAttribute: (node) => {
        if (
          node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
          !HANDLER_PROP.test(node.name.name) ||
          node.value?.type !== AST_NODE_TYPES.JSXExpressionContainer ||
          node.value.expression.type === AST_NODE_TYPES.JSXEmptyExpression
        ) {
          return;
        }

        addHandler(node.value.expression);
      },

      CallExpression: (node) => {
        const callee = skipTypeWrappers(node.callee);

        const domName = domExportOf(node.callee);

        if (
          (callee.type === AST_NODE_TYPES.MemberExpression &&
            isPropertyNamed(callee, 'addEventListener')) ||
          (callee.type === AST_NODE_TYPES.Identifier &&
            callee.name === 'addEventListener' &&
            !isLocallyBound(sourceCode, callee, 'addEventListener'))
        ) {
          addHandler(node.arguments[1]);
        } else if (domName === 'listenInScope') {
          addHandler(node.arguments[2]);
        }

        if (createsObservable(node, domName)) {
          mut_creations.add(node);
        }

        if (callee.type === AST_NODE_TYPES.Identifier) {
          const fn = localFunctionOf(sourceCode, callee);

          if (fn !== undefined) {
            mut_localCalls.push([node, fn]);
          }
        }
      },

      'Program:exit': () => {
        if (mut_handlers.size === 0 || mut_creations.size === 0) {
          return;
        }

        addReachedFunctions();

        for (const creation of mut_creations) {
          if (placeOf(creation) === 'handler') {
            context.report({
              node: creation,
              messageId: 'observableInHandler',
            });
          }
        }
      },
    };
  },
} as const;

const SYNSTATE_DOM_MODULE = 'synstate-dom';

/** `onClick`, `onInput`: a prop whose value JSX treats as an event handler. */
const HANDLER_PROP = /^on[A-Z]/u;

/**
 * synstate's factories whose observable keeps working while it lives: it has
 * parents to follow or a subscription to an outside source. `counter` is judged
 * by its options, since one with `times` stops by itself.
 */
const SYNSTATE_LASTING_FACTORIES: ReadonlySet<string> = new Set<string>([
  'combine',
  'derive',
  'fromSubscribable',
  'merge',
  'zip',
]);

/**
 * synstate-dom's factories that derive an observable from another. Given only
 * constants they create nothing, but a handler has no reason to call them so.
 */
const DOM_DERIVING_FACTORIES: ReadonlySet<string> = new Set<string>([
  'deriveBindable',
  'mapBindable',
  'toObservable',
]);
