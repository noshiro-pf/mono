import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { createGetLayerTypes, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { isSameReference } from './reference-utils.mjs';

type Options = readonly [
  Readonly<{
    guardFunctions?: readonly string[];
  }>?,
];

type MessageIds = 'missingImeGuard';

/**
 * Report a comparison of a keyboard event's `key` or `code` with `'Enter'` (or
 * `'NumpadEnter'`) — `===`, `!==`, `==`, `!=` or a `case 'Enter':` of a
 * `switch` on it — when nothing checks the same event for input method
 * composition.
 *
 * ## Why
 *
 * The Enter that confirms an input method's conversion is a key down too, with
 * `key` `'Enter'`. A handler that acts on it submits a half-typed Japanese (or
 * Chinese, Korean, …) value. A handler has to leave it alone: while
 * `event.isComposing` is `true`, and — since Safari sends the confirming Enter
 * after `compositionend` — when its key code is 229.
 *
 * ## What counts as a check
 *
 * A read of `isComposing` on the same event (`event.isComposing`, or
 * `event.nativeEvent.isComposing` for a React event), or a call of one of the
 * `guardFunctions` (default: `isImeKeyDown`, which `synstate-dom` exports and
 * which covers Safari's case as well) with the event or its `nativeEvent` as an
 * argument (or, for a comparison of `event.nativeEvent.key`, with `event`).
 * "The same event" is the same variable, not the same name, so a check of a
 * same-named parameter of another handler does not count. The check may be
 * anywhere — the same condition, an early return before a `switch`, an
 * enclosing function — so its place is not judged, only that it exists.
 * `isComposing` alone misses Safari's Enter, so prefer the guard function.
 *
 * Only an object whose type (or a member of whose union type) has an
 * `isComposing` or a `nativeEvent` property is taken for an event, so that a
 * `key` field of anything else is left alone; one typed `any` is left alone
 * too. A key read through destructuring (`({ key }) => key === 'Enter'`) or
 * tested by a collection (`keys.has(event.key)`) is not seen, and neither is a
 * `keyup` handler's need for a different guard: on the key up of the confirming
 * Enter, `isComposing` is already `false`.
 *
 * Enter on a button, a tab or another element that takes no text cannot come
 * from an input method, but the rule cannot tell the element from the handler;
 * the guard costs nothing there, so add it rather than turning the rule off.
 */
export const requireImeGuardOnEnter: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'problem',
      docs: {
        description:
          "Require a keyboard handler that compares `event.key` or `event.code` with `'Enter'` to check the same event for input method composition",
      },
      schema: [
        {
          type: 'object',
          properties: {
            guardFunctions: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Names of functions that, called with the event, tell an input method\'s key down (default: `["isImeKeyDown"]`)',
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        missingImeGuard:
          "This compares the key with 'Enter' but nothing checks the event for input method composition, so the Enter that confirms a conversion acts too. Leave the event alone when `isImeKeyDown(event)` (from `synstate-dom`; `isImeKeyDown(event.nativeEvent)` for a React event) is true, which also covers Safari's Enter after `compositionend`; `isComposing` alone does not.",
      },
      defaultOptions: [{}],
    },

    create: (context) => {
      const guardFunctions: ReadonlySet<string> = new Set(
        context.options[0]?.guardFunctions ?? defaultGuardFunctions,
      );

      const parserServices = ESLintUtils.getParserServices(context);

      const getLayerTypes = createGetLayerTypes(parserServices);

      const checker = parserServices.program.getTypeChecker();

      // `event?.key` reads the key of a `KeyboardEvent | undefined`.
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      const isEventType = (type: ts.Type): boolean => {
        if ((type.flags & ts.TypeFlags.Any) !== 0) {
          return false;
        }

        const event = checker.getApparentType(checker.getNonNullableType(type));

        // A union has a property only when every member has it.
        if (event.isUnion()) {
          return event.types.some(isEventType);
        }

        return (
          event.getProperty('isComposing') !== undefined ||
          event.getProperty('nativeEvent') !== undefined
        );
      };

      const isEventLike = (node: DeepReadonly<TSESTree.Expression>): boolean =>
        getLayerTypes(node).some(isEventType);

      const mut_comparisons: DeepReadonly<{
        report: TSESTree.Node;
        event: TSESTree.Expression;
      }>[] = [];

      // The expressions a check is made on: `event` for `event.isComposing` and
      // `isImeKeyDown(event)`.
      const mut_checked: DeepReadonly<TSESTree.Node>[] = [];

      const addComparison = (
        report: DeepReadonly<TSESTree.Node>,
        keyRead: DeepReadonly<TSESTree.Node>,
      ): void => {
        const event = eventOfKeyRead(keyRead);

        if (event !== undefined && isEventLike(event)) {
          mut_comparisons.push({ report, event });
        }
      };

      const isGuardCallee = (
        callee: DeepReadonly<TSESTree.Expression>,
      ): boolean => {
        const inner = skipTypeWrappers(callee);

        return inner.type === AST_NODE_TYPES.Identifier
          ? guardFunctions.has(inner.name)
          : inner.type === AST_NODE_TYPES.MemberExpression &&
              !inner.computed &&
              inner.property.type === AST_NODE_TYPES.Identifier &&
              guardFunctions.has(inner.property.name);
      };

      return {
        BinaryExpression: (node) => {
          if (!comparisonOperators.has(node.operator)) {
            return;
          }

          if (isEnterLiteral(node.right)) {
            addComparison(node, node.left);
          } else if (isEnterLiteral(node.left)) {
            addComparison(node, node.right);
          }
        },

        SwitchCase: (node) => {
          if (node.test !== null && isEnterLiteral(node.test)) {
            addComparison(node.test, node.parent.discriminant);
          }
        },

        MemberExpression: (node) => {
          if (staticName(node) === 'isComposing') {
            mut_checked.push(node.object);
          }
        },

        CallExpression: (node) => {
          if (isGuardCallee(node.callee)) {
            mut_checked.push(
              ...node.arguments.filter(
                (arg) => arg.type !== AST_NODE_TYPES.SpreadElement,
              ),
            );
          }
        },

        'Program:exit': () => {
          for (const { report, event } of mut_comparisons) {
            const eventVariable = variableOf(context.sourceCode, event);

            const isChecked = mut_checked.some(
              (checked) =>
                isCheckOf(checked, event) &&
                variableOf(context.sourceCode, checked) === eventVariable,
            );

            if (!isChecked) {
              context.report({ loc: report.loc, messageId: 'missingImeGuard' });
            }
          }
        },
      };
    },
  } as const;

const defaultGuardFunctions = ['isImeKeyDown'] as const;

// `NumpadEnter` is the numeric keypad's `code`; its `key` is `Enter`.
const enterKeys: ReadonlySet<string> = new Set<string>([
  'Enter',
  'NumpadEnter',
]);

const keyProperties: ReadonlySet<string> = new Set<string>(['key', 'code']);

const comparisonOperators: ReadonlySet<string> = new Set<string>([
  '===',
  '!==',
  '==',
  '!=',
]);

const isEnterLiteral = (node: DeepReadonly<TSESTree.Node>): boolean => {
  const inner = skipTypeWrappers(node);

  const value =
    inner.type === AST_NODE_TYPES.Literal
      ? inner.value
      : inner.type === AST_NODE_TYPES.TemplateLiteral &&
          Arr.isEmpty(inner.expressions)
        ? inner.quasis[0]?.value.cooked
        : undefined;

  return typeof value === 'string' && enterKeys.has(value);
};

const staticName = (
  node: DeepReadonly<TSESTree.MemberExpression>,
): string | undefined =>
  !node.computed
    ? node.property.type === AST_NODE_TYPES.Identifier
      ? node.property.name
      : undefined
    : node.property.type === AST_NODE_TYPES.Literal &&
        typeof node.property.value === 'string'
      ? node.property.value
      : undefined;

/**
 * `event` for a read of `event.key`, `event['key']`, `event?.key` or
 * `event.code`, through type wrappers; `undefined` for anything else.
 */
const eventOfKeyRead = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Expression> | undefined => {
  const unwrapped = skipTypeWrappers(node);

  const inner =
    unwrapped.type === AST_NODE_TYPES.ChainExpression
      ? unwrapped.expression
      : unwrapped;

  return inner.type === AST_NODE_TYPES.MemberExpression &&
    keyProperties.has(staticName(inner) ?? '')
    ? inner.object
    : undefined;
};

/** `event` for `event.nativeEvent`, through type wrappers. */
const nativeEventOwner = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> | undefined => {
  const inner = skipTypeWrappers(node);

  return inner.type === AST_NODE_TYPES.MemberExpression &&
    staticName(inner) === 'nativeEvent'
    ? inner.object
    : undefined;
};

/**
 * Whether `checked` is a check of `event` by name: the same expression, or one
 * the other's `nativeEvent` (a React event's DOM event).
 */
const isCheckOf = (
  checked: DeepReadonly<TSESTree.Node>,
  event: DeepReadonly<TSESTree.Node>,
): boolean =>
  isSameReference(checked, event) ||
  isSameReference(nativeEventOwner(checked) ?? checked, event) ||
  isSameReference(checked, nativeEventOwner(event) ?? event);

/** `event` for `event.a.b`, `(event as T).a` or `event!.a`. */
const rootOf = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const inner = skipTypeWrappers(node);

  return inner.type === AST_NODE_TYPES.MemberExpression
    ? rootOf(inner.object)
    : inner;
};

/**
 * The `@typescript-eslint/utils` helpers take mutable nodes; this rule only
 * ever reads them.
 */
const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;

/**
 * The variable `node`'s root names (`event` for `event.nativeEvent`), so that a
 * check of a same-named parameter of another function is told apart;
 * `undefined` for a global or a root that is not an identifier, which only a
 * check by the same name then matches.
 */
const variableOf = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  node: DeepReadonly<TSESTree.Node>,
): TSESLint.Scope.Variable | undefined => {
  const root = rootOf(node);

  return root.type === AST_NODE_TYPES.Identifier
    ? (ASTUtils.findVariable(sourceCode.getScope(asNode(root)), root.name) ??
        undefined)
    : undefined;
};
