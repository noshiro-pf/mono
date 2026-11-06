import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  isShadowedCallee,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';
import { mayStopByItself } from './counter-options.mjs';

type Options = readonly [];

type MessageIds = 'unboundedCounterPipe';

/**
 * `counter(ms).pipe(...)` keeps no reference to the counter, so nothing can
 * complete it, and since synstate 4.0.0 a child completing does not complete
 * its parents, so the derived observable cannot either. Only a counter that
 * stops by itself, after `{ times: N }` emissions, can be piped without a name.
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
      defaultOptions: [],
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
 * Whether `callee` calls the `counter` synstate exports: by a named import, an
 * aliased one or a namespace import, and through type wrappers. A local binding
 * that shadows the import is not synstate's.
 */
const isSynstateCounter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  resolveCallee: ReturnType<typeof buildCalleeResolver>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
): boolean => {
  const resolved = resolveCallee(callee);

  return (
    resolved?.canonicalName === 'counter' &&
    !isShadowedCallee(sourceCode, resolved, SYNSTATE_MODULE)
  );
};
