import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';
import { isTypeWrapper, skipTypeWrappers } from './type-wrappers.mjs';

/**
 * `rule` with every node inside a function that runs in the browser left
 * unvisited (see {@link isInBrowserEvaluatedFunction}). Playwright and
 * Puppeteer serialize such a function and run it in the page, where the
 * file's imports do not exist, so a fix that calls an imported library there
 * breaks it at runtime.
 *
 * The nodes are kept from the rule's listeners rather than its reports are
 * dropped: a rule that puts its import fix on the first of the reports it
 * collects would otherwise lose the import along with that report, and leave
 * the other fixes calling a name nothing imports.
 */
export const skipBrowserEvaluatedFunctions = <
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  rule: TSESLint.RuleModule<MessageIds, Options>,
): TSESLint.RuleModule<MessageIds, Options> => ({
  ...rule,
  create: (context) =>
    Object.fromEntries(
      Object.entries(rule.create(context)).map(([selector, listener]) => [
        selector,
        CODE_PATH_EVENT.test(selector)
          ? listener
          : (node: DeepReadonly<TSESTree.Node>): void => {
              if (
                typeof listener === 'function' &&
                !isInBrowserEvaluatedFunction(node)
              ) {
                Reflect.apply(listener, undefined, [node]);
              }
            },
      ]),
    ),
});

/**
 * Whether `node` is inside a function passed to one of
 * {@link BROWSER_EVALUATING_METHODS}, behind any type wrapper or parentheses:
 * `page.evaluate(() => …)`, `locator.evaluate((node) => …)`. The other
 * arguments of the call (`page.evaluate(fn, arg)`) run in the test, and stay
 * in.
 *
 * The receiver's type is not checked: a method of the same name on another
 * object only makes a rule miss what it would have reported.
 */
export const isInBrowserEvaluatedFunction = (
  node: DeepReadonly<TSESTree.Node>,
): boolean =>
  // The program is the root; its `parent` is `null` at runtime.
  node.type !== AST_NODE_TYPES.Program &&
  ((isFunction(node) && isBrowserEvaluatedArgument(node)) ||
    isInBrowserEvaluatedFunction(node.parent));

/**
 * The code path listeners (`onCodePathStart(codePath, node)` and the like),
 * which take something other than a node first. They are left as they are.
 */
const CODE_PATH_EVENT = /^on(?:Unreachable)?CodePath/u;

/**
 * The methods that serialize a function and run it in the page: Playwright's
 * `Page`, `Frame`, `Locator`, `ElementHandle` and `JSHandle`, and Puppeteer's
 * counterparts.
 */
const BROWSER_EVALUATING_METHODS: ReadonlySet<string> = new Set([
  '$$eval',
  '$eval',
  'addInitScript',
  'evaluate',
  'evaluateAll',
  'evaluateHandle',
  'evaluateOnNewDocument',
  'waitForFunction',
]);

const isFunction = (node: DeepReadonly<TSESTree.Node>): boolean =>
  node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
  node.type === AST_NODE_TYPES.FunctionExpression;

/** Whether `fn` is an argument of a call to a browser-evaluating method. */
const isBrowserEvaluatedArgument = (
  fn: DeepReadonly<TSESTree.Node>,
): boolean => {
  const argument = outermostTypeWrapper(fn);

  const call = argument.parent;

  if (
    call?.type !== AST_NODE_TYPES.CallExpression ||
    call.arguments.every((callArgument) => callArgument !== argument)
  ) {
    return false;
  }

  const callee = skipTypeWrappers(call.callee);

  return (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    callee.property.type === AST_NODE_TYPES.Identifier &&
    BROWSER_EVALUATING_METHODS.has(callee.property.name)
  );
};

/** The outermost of the type wrappers around `node`, or `node` itself. */
const outermostTypeWrapper = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> =>
  node.type !== AST_NODE_TYPES.Program && isTypeWrapper(node.parent)
    ? outermostTypeWrapper(node.parent)
    : node;
