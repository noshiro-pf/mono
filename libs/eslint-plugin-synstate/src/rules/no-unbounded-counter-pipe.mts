import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  hasForeignBinding,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'unboundedCounterPipe';

/**
 * `counter(ms).pipe(...)` keeps no reference to the counter, so nothing can
 * complete it, and once a child completing no longer completes its parents
 * (synstate's `NEXT_MAJOR.md`) the derived observable cannot either. Only a
 * counter that stops by itself, after `{ times: N }` emissions, can be piped
 * without a name.
 *
 * The type cannot forbid this: the same `.pipe` is fine once the counter is
 * bound to a name that can be completed later.
 */
export const noUnboundedCounterPipe: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'problem',
      docs: {
        description:
          'Disallow calling `.pipe` directly on a synstate `counter(...)` that has no `times` option, since nothing can ever stop that counter.',
      },
      schema: [],
      messages: {
        unboundedCounterPipe:
          'This `counter(...)` is piped without being named and without a `times` option, so nothing can ever stop it. Pass `{ times: N }`, or bind the counter to a name and complete it when it is no longer needed.',
      },
    },

    create: (context) => {
      const sourceCode = context.sourceCode;

      const resolveCallee = buildCalleeResolver(
        getImportDeclarations(sourceCode.ast, SYNSTATE_MODULE),
      );

      return {
        CallExpression: (node) => {
          const callee = skipTypeWrappers(node.callee);

          if (
            callee.type !== AST_NODE_TYPES.MemberExpression ||
            !isPipeProperty(callee)
          ) {
            return;
          }

          const receiver = skipTypeWrappers(callee.object);

          if (
            receiver.type !== AST_NODE_TYPES.CallExpression ||
            !isSynstateCounter(sourceCode, resolveCallee, receiver.callee) ||
            mayStopByItself(receiver.arguments)
          ) {
            return;
          }

          context.report({
            node: receiver,
            messageId: 'unboundedCounterPipe',
          });
        },
      };
    },
    defaultOptions: [],
  } as const;

/** `x.pipe` or `x['pipe']`. */
const isPipeProperty = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  member: TSESTree.MemberExpression,
): boolean =>
  member.computed
    ? member.property.type === AST_NODE_TYPES.Literal &&
      member.property.value === 'pipe'
    : member.property.type === AST_NODE_TYPES.Identifier &&
      member.property.name === 'pipe';

/**
 * Whether `callee` calls the `counter` synstate exports: by a named import,
 * an aliased one or a namespace import, and through type wrappers. A local
 * binding that shadows the import is not synstate's.
 */
const isSynstateCounter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  resolveCallee: ReturnType<typeof buildCalleeResolver>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
): boolean => {
  const resolved = resolveCallee(callee);

  if (resolved?.canonicalName !== 'counter') {
    return false;
  }

  const boundName = boundIdentifierOf(callee);

  return (
    boundName !== undefined &&
    !hasForeignBinding(sourceCode, boundName, boundName.name, SYNSTATE_MODULE)
  );
};

/**
 * The identifier whose binding decides what `callee` calls: the callee itself
 * for a named import, the namespace object for `m.counter`.
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

/**
 * Whether the arguments of `counter(...)` may carry a `times` option. Only
 * what the source shows is judged: options passed as a variable, spread in,
 * or keyed by a computed name might hold `times`, and are given the benefit
 * of the doubt.
 */
const mayStopByItself = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  args: readonly TSESTree.CallExpressionArgument[],
): boolean => {
  if (args.some((arg) => arg.type === AST_NODE_TYPES.SpreadElement)) {
    return true;
  }

  const options = args[1];

  if (options === undefined) {
    return false;
  }

  const unwrapped = skipTypeWrappers(options);

  if (
    unwrapped.type === AST_NODE_TYPES.Identifier &&
    unwrapped.name === 'undefined'
  ) {
    return false;
  }

  if (unwrapped.type !== AST_NODE_TYPES.ObjectExpression) {
    return true;
  }

  return unwrapped.properties.some(
    (property) =>
      property.type === AST_NODE_TYPES.SpreadElement || mayBeTimesKey(property),
  );
};

const mayBeTimesKey = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  property: TSESTree.Property,
): boolean => {
  const { key } = property;

  return key.type === AST_NODE_TYPES.Literal
    ? key.value === 'times'
    : property.computed ||
        (key.type === AST_NODE_TYPES.Identifier && key.name === 'times');
};
