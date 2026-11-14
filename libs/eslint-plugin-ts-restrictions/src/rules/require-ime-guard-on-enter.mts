import {
  AST_NODE_TYPES,
  ASTUtils,
  ESLintUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  asNode,
  buildCalleeResolver,
  createGetLayerTypes,
  isRuntimeBound,
  isShadowedCallee,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { isSameReference, staticPropertyName } from './reference-utils.mjs';

type Options = readonly [
  Readonly<{
    guardFunctions?: readonly string[];
    keys?: readonly CheckedKey[];
  }>?,
];

type CheckedKey = 'Enter' | 'Escape';

type MessageIds = 'missingImeGuard' | 'missingImeGuardOnEscape';

/**
 * Report a comparison of a keyboard event's `key` or `code` with `'Enter'` (or
 * `'NumpadEnter'`) or `'Escape'` — `===`, `!==`, `==`, `!=`, a `case 'Enter':`
 * of a `switch` on it, or `includes` / `has` on a literal array or `Set` that
 * holds it — when nothing checks the same event for input method composition.
 * The key may be read into a `const` first (`const key = event.key`).
 *
 * ## Why
 *
 * The Enter that confirms an input method's conversion is a key down too, with
 * `key` `'Enter'`. A handler that acts on it submits a half-typed Japanese (or
 * Chinese, Korean, …) value. The Escape that cancels a conversion is the same:
 * a handler that acts on it closes a dialog or drops an edit the user only
 * meant to leave the conversion. A handler has to leave both alone: while
 * `event.isComposing` is `true`, and — since Safari sends the confirming Enter
 * or Escape after `compositionend` — when its key code is 229. Escape is
 * reported by this rule under its own message id, since the guard, the event
 * walk and the key comparison are the same code; the `keys` option (default
 * `["Enter", "Escape"]`) turns either off.
 *
 * ## What counts as a check
 *
 * A read of `isComposing` on the same event (`event.isComposing`, or
 * `event.nativeEvent.isComposing` for a React event), or a call of one of the
 * `guardFunctions` (default: `isImeKeyDown`, which `synstate-dom` exports and
 * which covers Safari's case as well) with the event or its `nativeEvent` as an
 * argument (or, for a comparison of `event.nativeEvent.key`, with `event`).
 * "The same event" is the same variable, not the same name, so a check of a
 * same-named parameter of another handler does not count. A `const` bound to
 * a variable or a member chain on one (`const native = event.nativeEvent`) is
 * read as what it names, on the key's side and the check's, but a destructured
 * one, or an alias at the root of a member chain, is not. The check may be
 * anywhere — the same condition, an early return before a `switch`, an
 * enclosing function — so its place is not judged, only that it exists.
 * `isComposing` alone misses Safari's Enter, so prefer the guard function.
 * A guard function is matched by the name it is exported under, so
 * `import { isImeKeyDown as imeKey }` counts and `import { other as
 * isImeKeyDown }` does not; an import of `default`, a function the file
 * declares itself and a method (`keys.isImeKeyDown(event)`,
 * `keys['isImeKeyDown'](event)`) are matched by the name they are called by,
 * and a guard bound to a `const` of another name is not seen. An optional chain
 * around a guard's argument or a key read's event
 * (`isImeKeyDown(event?.nativeEvent)`, `(event?.nativeEvent)!.key`) is read
 * through; one parenthesized deeper in a member chain is not.
 *
 * Only an object whose type (or a member of whose union type) has an
 * `isComposing` or a `nativeEvent` property is taken for an event, so that a
 * `key` field of anything else is left alone; one typed `any` is left alone
 * too. A key read through destructuring (`({ key }) => key === 'Enter'`), into
 * a `let`, inside a logical expression or a call (`event?.key ?? ''`), or
 * tested by a collection the file does not write out as a literal is not seen,
 * nor a key named by a `const` rather than written as a literal
 * (`event.key === ENTER`), and neither is a `keyup` handler's need for a
 * different guard: on the key up of the confirming Enter, `isComposing` is
 * already `false`.
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
          "Require a keyboard handler that compares `event.key` or `event.code` with `'Enter'` or `'Escape'` to check the same event for input method composition",
      },
      schema: [
        {
          type: 'object',
          properties: {
            guardFunctions: {
              type: 'array',
              items: { type: 'string' },
              description:
                'Names of functions that, called with the event, tell an input method\'s key down: the exported name for a named or namespace import, the name it is called by for anything else (default: `["isImeKeyDown"]`)',
            },
            keys: {
              type: 'array',
              items: { type: 'string', enum: ['Enter', 'Escape'] },
              uniqueItems: true,
              description:
                'The keys whose comparisons need the check (default: `["Enter", "Escape"]`)',
            },
          },
          additionalProperties: false,
        },
      ],
      messages: {
        missingImeGuard:
          "This compares the key with 'Enter' but nothing checks the event for input method composition, so the Enter that confirms a conversion acts too. Leave the event alone when `isImeKeyDown(event)` (from `synstate-dom`; `isImeKeyDown(event.nativeEvent)` for a React event) is true, which also covers Safari's Enter after `compositionend`; `isComposing` alone does not.",
        missingImeGuardOnEscape:
          "This compares the key with 'Escape' but nothing checks the event for input method composition, so the Escape that cancels a conversion acts too, closing or discarding what the user only meant to leave the conversion of. Leave the event alone when `isImeKeyDown(event)` (from `synstate-dom`; `isImeKeyDown(event.nativeEvent)` for a React event) is true, which also covers Safari's Escape after `compositionend`; `isComposing` alone does not.",
      },
      defaultOptions: [{}],
    },

    create: (context) => {
      const guardFunctions: ReadonlySet<string> = new Set(
        context.options[0]?.guardFunctions ?? defaultGuardFunctions,
      );

      const checkedKeys: ReadonlySet<CheckedKey> = new Set(
        context.options[0]?.keys ?? allCheckedKeys,
      );

      const { sourceCode } = context;

      const importDeclarations = sourceCode.ast.body.filter(
        (node): node is TSESTree.ImportDeclaration =>
          node.type === AST_NODE_TYPES.ImportDeclaration,
      );

      const importedModules = importDeclarations.map(
        (declaration) => declaration.source.value,
      );

      const resolveImportedCallee = buildCalleeResolver(importDeclarations);

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
        event: TSESTree.Node;
        key: CheckedKey;
      }>[] = [];

      // The expressions a check is made on: `event` for `event.isComposing` and
      // `isImeKeyDown(event)`.
      const mut_checked: DeepReadonly<TSESTree.Node>[] = [];

      // The standard `Set`: not a value the file declares or imports. A type, an
      // interface or a `declare const` of that name leaves it the standard one.
      const isStandardSet = (
        callee: DeepReadonly<TSESTree.Identifier>,
      ): boolean => !isRuntimeBound(sourceCode, asNode(callee), 'Set');

      const keyReadEvent = (
        keyRead: DeepReadonly<TSESTree.Node>,
      ): DeepReadonly<TSESTree.Expression> | undefined =>
        eventOfKeyRead(sourceCode, keyRead, maxConstDepth);

      // `event` is the object the key is read from, from `keyReadEvent`, and
      // `key` one the `keys` option checks: each caller filters by the option.
      const addEventComparison = (
        report: DeepReadonly<TSESTree.Node>,
        event: DeepReadonly<TSESTree.Expression>,
        key: CheckedKey,
      ): void => {
        if (isEventLike(event)) {
          mut_comparisons.push({
            report,
            event: referenceThroughConsts(sourceCode, event, maxConstDepth),
            key,
          });
        }
      };

      // The key is told first, so that a comparison of anything else costs no
      // scope lookup.
      const addComparison = (
        report: DeepReadonly<TSESTree.Node>,
        keyRead: DeepReadonly<TSESTree.Node>,
        key: CheckedKey | undefined,
      ): void => {
        if (key === undefined || !checkedKeys.has(key)) {
          return;
        }

        const event = keyReadEvent(keyRead);

        if (event !== undefined) {
          addEventComparison(report, event, key);
        }
      };

      // The name the callee is exported under when it calls a named or
      // namespace import, so that an alias is seen through and another export
      // bound to a guard's name is not taken for the guard; its own name
      // otherwise, an import of `default` included, since `default` names
      // nothing to check it against. A `guardFunctions` entry therefore names
      // what a module exports: a local alias listed there does not match the
      // import it renames, or `import { other as isImeKeyDown }` would.
      const calleeName = (
        callee: DeepReadonly<TSESTree.Expression>,
      ): string | undefined => {
        const inner = skipTypeWrappers(callee);

        const spelled =
          inner.type === AST_NODE_TYPES.Identifier
            ? inner.name
            : inner.type === AST_NODE_TYPES.MemberExpression
              ? staticPropertyName(inner)
              : undefined;

        const resolved = resolveImportedCallee(asNode(callee));

        if (resolved === undefined || resolved.canonicalName === 'default') {
          return spelled;
        }

        // Neither name is a guard, so whichever the call goes by, it is none;
        // the scope lookup below is spared for most imported calls.
        if (
          !guardFunctions.has(resolved.canonicalName) &&
          !guardFunctions.has(spelled ?? '')
        ) {
          return resolved.canonicalName;
        }

        return isShadowedCallee(sourceCode, resolved, importedModules)
          ? spelled
          : resolved.canonicalName;
      };

      const isGuardCallee = (
        callee: DeepReadonly<TSESTree.Expression>,
      ): boolean => guardFunctions.has(calleeName(callee) ?? '');

      return {
        BinaryExpression: (node) => {
          if (!comparisonOperators.has(node.operator)) {
            return;
          }

          const rightKey = checkedKeyOf(node.right);

          if (rightKey !== undefined) {
            addComparison(node, node.left, rightKey);
          } else {
            addComparison(node, node.right, checkedKeyOf(node.left));
          }
        },

        SwitchCase: (node) => {
          if (node.test !== null) {
            addComparison(
              node.test,
              node.parent.discriminant,
              checkedKeyOf(node.test),
            );
          }
        },

        MemberExpression: (node) => {
          // Every member access is named, a computed one by `getStaticValue`,
          // so that `event[`isComposing`]` counts as `event.isComposing` does.
          if (staticPropertyName(node) === 'isComposing') {
            mut_checked.push(node.object);
          }
        },

        CallExpression: (node) => {
          if (isGuardCallee(node.callee)) {
            mut_checked.push(
              ...node.arguments.flatMap((arg) =>
                arg.type === AST_NODE_TYPES.SpreadElement
                  ? []
                  : [withoutChain(arg)],
              ),
            );

            return;
          }

          const keyRead = node.arguments[0];

          const collection = collectionOfMembershipTest(node.callee);

          if (
            collection === undefined ||
            keyRead === undefined ||
            keyRead.type === AST_NODE_TYPES.SpreadElement
          ) {
            return;
          }

          // What reads no key is left before the collection is read, and the
          // type query that tells an event (in addEventComparison) comes last.
          const event = keyReadEvent(keyRead);

          if (event === undefined) {
            return;
          }

          const values = literalStringsOf(
            sourceCode,
            isStandardSet,
            collection,
            maxConstDepth,
          );

          // A collection holding both keys is reported once, under the first key
          // the `keys` option checks.
          const key = allCheckedKeys.find(
            (candidate) =>
              checkedKeys.has(candidate) &&
              values.some((value) => checkedKeyOfValue(value) === candidate),
          );

          if (key !== undefined) {
            addEventComparison(node, event, key);
          }
        },

        'Program:exit': () => {
          if (Arr.isEmpty(mut_comparisons)) {
            return;
          }

          const checks = mut_checked.map((rawChecked) => {
            const checked = referenceThroughConsts(
              sourceCode,
              rawChecked,
              maxConstDepth,
            );

            return {
              checked,
              variable: variableOf(sourceCode, checked),
            } as const;
          });

          for (const { report, event, key } of mut_comparisons) {
            const eventVariable = variableOf(sourceCode, event);

            const isChecked = checks.some(
              ({ checked, variable }) =>
                isCheckOf(checked, event) && variable === eventVariable,
            );

            if (!isChecked) {
              context.report({
                loc: report.loc,
                messageId:
                  key === 'Escape'
                    ? 'missingImeGuardOnEscape'
                    : 'missingImeGuard',
              });
            }
          }
        },
      };
    },
  } as const;

const defaultGuardFunctions = ['isImeKeyDown'] as const;

const allCheckedKeys = ['Enter', 'Escape'] as const;

// How many `const` bindings a key read or a collection is followed through.
const maxConstDepth = 8;

// `NumpadEnter` is the numeric keypad's `code`; its `key` is `Enter`.
const enterKeys: ReadonlySet<string> = new Set<string>([
  'Enter',
  'NumpadEnter',
]);

const membershipMethods: ReadonlySet<string> = new Set<string>([
  'includes',
  'has',
]);

const keyProperties: ReadonlySet<string> = new Set<string>(['key', 'code']);

const comparisonOperators: ReadonlySet<string> = new Set<string>([
  '===',
  '!==',
  '==',
  '!=',
]);

const checkedKeyOfValue = (value: string): CheckedKey | undefined =>
  enterKeys.has(value) ? 'Enter' : value === 'Escape' ? 'Escape' : undefined;

/** The string a literal (or a template literal with no substitutions) holds. */
const literalString = (
  node: DeepReadonly<TSESTree.Node>,
): string | undefined => {
  const inner = skipTypeWrappers(node);

  const value =
    inner.type === AST_NODE_TYPES.Literal
      ? inner.value
      : inner.type === AST_NODE_TYPES.TemplateLiteral &&
          Arr.isEmpty(inner.expressions)
        ? inner.quasis[0]?.value.cooked
        : undefined;

  return typeof value === 'string' ? value : undefined;
};

/** `'Enter'` or `'Escape'` for a literal naming that key. */
const checkedKeyOf = (
  node: DeepReadonly<TSESTree.Node>,
): CheckedKey | undefined => {
  const value = literalString(node);

  return value === undefined ? undefined : checkedKeyOfValue(value);
};

const withoutChain = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> => {
  const unwrapped = skipTypeWrappers(node);

  return unwrapped.type === AST_NODE_TYPES.ChainExpression
    ? skipTypeWrappers(unwrapped.expression)
    : unwrapped;
};

// The plugins that follow a `const` each keep their own lookup, since each asks
// something different of the binding (a type annotation, say).
/**
 * The initializer of the `const` an identifier names — `event.key` for `key`
 * after `const key = event.key` — or `undefined` when it names anything else:
 * a `let`, a parameter, a destructured binding, an import.
 */
const constInitOf = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Expression> | undefined => {
  if (node.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const variable = ASTUtils.findVariable(
    sourceCode.getScope(asNode(node)),
    node.name,
  );

  const [definition, ...rest] = variable?.defs ?? [];

  return definition !== undefined &&
    Arr.isEmpty(rest) &&
    definition.type === TSESLint.Scope.DefinitionType.Variable &&
    definition.parent.kind === 'const' &&
    definition.node.id.type === AST_NODE_TYPES.Identifier
    ? (definition.node.init ?? undefined)
    : undefined;
};

/**
 * `event` for a read of `event.key`, `event['key']`, `event?.key` or
 * `event.code`, through type wrappers and `const` bindings (`key` after
 * `const key = event.key`); `undefined` for anything else.
 */
const eventOfKeyRead = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  node: DeepReadonly<TSESTree.Node>,
  depth: number,
): DeepReadonly<TSESTree.Expression> | undefined => {
  const inner = withoutChain(node);

  if (inner.type === AST_NODE_TYPES.MemberExpression) {
    return keyProperties.has(staticPropertyName(inner) ?? '')
      ? inner.object
      : undefined;
  }

  const init = depth > 0 ? constInitOf(sourceCode, inner) : undefined;

  return init === undefined
    ? undefined
    : eventOfKeyRead(sourceCode, init, depth - 1);
};

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
 * What a `const` that names another reference stands for — `event.nativeEvent`
 * for `native` after `const native = event.nativeEvent` — so that the event a
 * key is read from and the one a check is made on compare alike however either
 * was aliased. A `const` bound to anything but an identifier or a member chain
 * on one is left as it is, as its own reference: a chain on a call
 * (`getEvent().nativeEvent`) matches nothing once followed, and one on `this` or
 * `super` is not carried into the matching every `this` already shares, where
 * no variable tells one class's `this` from another's. That costs a report on
 * `const native = this.ev` read beside a guard on `this.ev`, until variableOf
 * gives a `this` root the function or class that binds it.
 *
 * Only the whole expression is followed, not the root of a member chain
 * (`e.nativeEvent` after `const e = event` stays as it is), and an alias of a
 * property, or of a variable reassigned later, is taken for what it names
 * wherever that is read, as the rule judges no check's place.
 */
const referenceThroughConsts = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  node: DeepReadonly<TSESTree.Node>,
  depth: number,
): DeepReadonly<TSESTree.Node> => {
  const init =
    depth > 0 ? constInitOf(sourceCode, withoutChain(node)) : undefined;

  // Either side ends read through an optional chain, as a guard's argument is,
  // so that `(event?.nativeEvent)!` meets `event?.nativeEvent`.
  if (init === undefined) {
    return withoutChain(node);
  }

  const target = withoutChain(init);

  return (target.type === AST_NODE_TYPES.Identifier ||
    target.type === AST_NODE_TYPES.MemberExpression) &&
    rootOf(target).type === AST_NODE_TYPES.Identifier
    ? referenceThroughConsts(sourceCode, target, depth - 1)
    : withoutChain(node);
};

/**
 * `xs` for a callee `xs.includes` or `xs.has` (or `xs?.has`), through type
 * wrappers; `undefined` for anything else.
 */
const collectionOfMembershipTest = (
  callee: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Expression> | undefined => {
  const inner = withoutChain(callee);

  return inner.type === AST_NODE_TYPES.MemberExpression &&
    membershipMethods.has(staticPropertyName(inner) ?? '')
    ? inner.object
    : undefined;
};

/**
 * The string literals a collection the file writes out holds: an array literal,
 * `new Set([...])`, or a `const` bound to either, through type wrappers. An
 * empty list for anything else.
 *
 * Unlike `getStaticValue`, which gives up on a whole array when one element is
 * not a constant, this keeps the literals an array holds beside other elements.
 */
const literalStringsOf = (
  sourceCode: DeepReadonly<TSESLint.SourceCode>,
  isStandardSet: (callee: DeepReadonly<TSESTree.Identifier>) => boolean,
  node: DeepReadonly<TSESTree.Node>,
  depth: number,
): readonly string[] => {
  const inner = withoutChain(node);

  if (inner.type === AST_NODE_TYPES.ArrayExpression) {
    return Arr.generate(function* () {
      for (const element of inner.elements) {
        const value =
          element === null || element.type === AST_NODE_TYPES.SpreadElement
            ? undefined
            : literalString(element);

        if (value !== undefined) {
          yield value;
        }
      }
    });
  }

  const setCallee =
    inner.type === AST_NODE_TYPES.NewExpression
      ? skipTypeWrappers(inner.callee)
      : undefined;

  if (
    inner.type === AST_NODE_TYPES.NewExpression &&
    setCallee?.type === AST_NODE_TYPES.Identifier &&
    setCallee.name === 'Set' &&
    isStandardSet(setCallee)
  ) {
    const [items] = inner.arguments;

    return items === undefined || items.type === AST_NODE_TYPES.SpreadElement
      ? []
      : literalStringsOf(sourceCode, isStandardSet, items, depth);
  }

  const init = depth > 0 ? constInitOf(sourceCode, inner) : undefined;

  return init === undefined
    ? []
    : literalStringsOf(sourceCode, isStandardSet, init, depth - 1);
};

/** `event` for `event.nativeEvent`, through type wrappers. */
const nativeEventOwner = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> | undefined => {
  const inner = skipTypeWrappers(node);

  return inner.type === AST_NODE_TYPES.MemberExpression &&
    staticPropertyName(inner) === 'nativeEvent'
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
