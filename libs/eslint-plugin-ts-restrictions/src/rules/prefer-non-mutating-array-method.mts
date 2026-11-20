import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  asNode,
  createGetLayerTypes,
  isTypeWrapper,
  mayHaveEffect,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  createIsArrayOrTupleType,
  createIsCopyNeededBySatisfies,
  matchArrayFromCall,
  toMemberObjectText,
} from './array-type-utils.mjs';

type Options = readonly [];

type MessageIds =
  | 'preferArrayFromMapFunction'
  | 'preferNonMutatingMethod'
  | 'preferNonMutatingMethodUnlessArgumentChangesArray'
  | 'useNonMutatingMethod';

/**
 * Mutating array methods that have a non-mutating counterpart usable when the
 * receiver is a throw-away `Array.from()` copy of an array:
 *
 * - `Array.from(xs).reverse()` → `xs.toReversed()`
 * - `Array.from(xs).sort(cmp?)` → `xs.toSorted(cmp?)`
 * - `Array.from(xs).fill(v)` → `Array.from(xs, () => v)`
 * - `Array.from(xs).splice(s)` → `xs.slice(s)`, and
 *   `Array.from(xs).splice(s, c)` → `xs.slice(s, s + c)` for non-negative
 *   integer literals `s` and `c`
 *
 * `splice` returns the elements it *removed*, while `toSpliced` returns the
 * array *without* them, so `toSpliced` is never its rewrite. The two shapes
 * above are those whose `slice` form returns the same elements for every array
 * length: with inserted items no `slice` does, and with a negative start and a
 * count the right `slice` depends on the length (`splice(-3, 1)` is
 * `slice(-3, -2)` on three or more elements only); a count that is not a
 * literal may be negative. A start-only `splice` has `slice`'s value whatever
 * the start, but a start that may have an effect would run after the copy and
 * before `slice` reads the array, so it has to be safe to evaluate
 * (`isSafeToReEvaluate`). The rewrite reads the array itself, so a hole stays a
 * hole where the copy held `undefined`, and an `Array` subclass typed as `T[]`
 * gets its own class back from `slice`. `fill` is rewritten to the mapping
 * function of `Array.from` instead, which fills the holes as the copy does
 * (`reportFill`).
 *
 * `Array.from(xs)` copies `xs` before the method's arguments are evaluated, and
 * the rewrite reads `xs` after them, so a call whose argument may have an
 * effect (`mayHaveEffect`: `sort(cmpAfterPush())`) is reported with the rewrite
 * as a suggestion only.
 *
 * The `Array.from()` call is found through type wrappers, which the fix keeps
 * (`(Array.from(xs) as T[]).sort()` → `(xs as T[]).toSorted()`), and the
 * argument's type is that of its value, not of a cast around it. A `satisfies`
 * around the call that the argument itself does not meet keeps the copy:
 * `(Array.from(xs) satisfies number[])` with `xs: readonly number[]` would not
 * type-check as `xs satisfies number[]`.
 */
const MUTATING_METHOD_NAMES: ReadonlySet<string> = new Set<string>([
  'fill',
  'reverse',
  'sort',
  'splice',
]);

/** `node`'s value when it is a non-negative integer literal, through wrappers. */
const nonNegativeIntegerLiteral = (
  node: DeepReadonly<TSESTree.CallExpressionArgument>,
): number | undefined => {
  if (node.type === AST_NODE_TYPES.SpreadElement) {
    return undefined;
  }

  const unwrapped = skipTypeWrappers(node);

  return unwrapped.type === AST_NODE_TYPES.Literal &&
    typeof unwrapped.value === 'number' &&
    Number.isSafeInteger(unwrapped.value) &&
    unwrapped.value >= 0
    ? unwrapped.value
    : undefined;
};

/**
 * Expressions that are safe to re-evaluate once per element inside a mapping
 * function: re-reading them cannot trigger side effects and always yields the
 * same value, so `Array.from(xs).fill(v)` → `Array.from(xs, () => v)` is
 * behavior preserving. Anything that may allocate (`{}`, `new Foo()`), call
 * code, or hit a getter is excluded — for those, `fill` shares one value across
 * all slots while the mapping function would create one per slot.
 */
const isSafeToReEvaluate = (
  node: DeepReadonly<TSESTree.Expression>,
): boolean => {
  // A type wrapper evaluates to its operand: `0 satisfies number`.
  if (isTypeWrapper(node)) {
    return isSafeToReEvaluate(skipTypeWrappers(node));
  }

  if (
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.ThisExpression ||
    node.type === AST_NODE_TYPES.Literal
  ) {
    return true;
  }

  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    return Arr.isEmpty(node.expressions);
  }

  if (node.type === AST_NODE_TYPES.UnaryExpression) {
    return (
      (node.operator === '-' || node.operator === '+') &&
      node.argument.type === AST_NODE_TYPES.Literal
    );
  }

  return false;
};

/**
 * The `slice(…)` that returns what `splice(…)` with `args` (written `argsText`)
 * removes from a copy, or `undefined` for a shape whose value `slice` does not
 * have (see {@link MUTATING_METHOD_NAMES}).
 */
const toSliceCall = (
  args: DeepReadonly<TSESTree.CallExpressionArgument[]>,
  argsText: string,
): string | undefined => {
  if (Arr.isFixedLengthArray(1, args)) {
    const [onlyStart] = args;

    return onlyStart.type !== AST_NODE_TYPES.SpreadElement &&
      isSafeToReEvaluate(onlyStart)
      ? `slice(${argsText})`
      : undefined;
  }

  if (!Arr.isFixedLengthArray(2, args)) {
    return undefined;
  }

  const [start, count] = args;

  const s = nonNegativeIntegerLiteral(start);

  const c = nonNegativeIntegerLiteral(count);

  return s === undefined || c === undefined
    ? undefined
    : `slice(${s}, ${s + c})`;
};

/**
 * Reports `Array.from(xs).fill(v)` and fixes it to `Array.from(xs, () => v)`.
 * `Array.from(xs)` turns a hole of a sparse array into `undefined`, which `fill`
 * then overwrites, while `xs.map(() => v)` skips a hole and keeps it
 * (`Array.from(Array(3)).fill(0)` is `[0, 0, 0]`, `Array(3).map(() => 0)` three
 * holes); the mapping function of `Array.from` is called for every index, holes
 * included, so it fills what `fill` does. The fix adds the function to the
 * `Array.from(…)` call, wrappers around it kept, and drops `.fill(v)`.
 */
// The token and fixer APIs of `SourceCode` take the AST's own mutable types.
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const reportFill = ({
  context,
  node,
  inner,
  arg,
  mapFunction,
}: Readonly<{
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
  node: TSESTree.CallExpression;
  inner: TSESTree.Node;
  arg: TSESTree.Expression;
  mapFunction: string;
}>): void => {
  const sourceCode = context.sourceCode;

  const closingParen = sourceCode.getLastToken(inner);

  const callee = node.callee;

  const accessToken =
    callee.type === AST_NODE_TYPES.MemberExpression
      ? sourceCode.getTokenBefore(callee.property)
      : null;

  if (closingParen === null || accessToken === null) {
    return;
  }

  // A trailing comma (`Array.from(xs,)`) already separates the new argument.
  const separator =
    sourceCode.getTokenBefore(closingParen)?.value === ',' ? ' ' : ', ';

  context.report({
    node,
    messageId: 'preferArrayFromMapFunction',
    data: {
      replacement: `Array.from(${sourceCode.getText(arg)}, ${mapFunction})`,
    },
    fix: (fixer) => [
      fixer.insertTextBefore(closingParen, `${separator}${mapFunction}`),
      fixer.removeRange([accessToken.range[0], node.range[1]]),
    ],
  });
};

export const preferNonMutatingArrayMethod: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow calling a mutating array method on a defensive `Array.from()` copy of an array (e.g. `Array.from(x).sort()`); use the non-mutating counterpart on the original array instead (e.g. `x.toSorted()`)',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      preferArrayFromMapFunction:
        'Filling a throw-away `Array.from()` copy with `fill` is roundabout. Give `Array.from` the value as a mapping function instead: `{{replacement}}`.',
      preferNonMutatingMethod:
        'Mutating a throw-away `Array.from()` copy with `{{mutatingMethod}}` is roundabout. Use `{{replacement}}` on the original array instead.',
      preferNonMutatingMethodUnlessArgumentChangesArray:
        'Mutating a throw-away `Array.from()` copy with `{{mutatingMethod}}` is roundabout, unless the copy is there because an argument changes the array: `Array.from()` copies it before the arguments run, `{{replacement}}` reads it after them. Use `{{replacement}}` on the original array if no argument changes it.',
      useNonMutatingMethod: 'Use `{{replacement}}` on the original array.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    const isArrayOrTupleType = createIsArrayOrTupleType(checker);

    const isCopyNeededBySatisfies = createIsCopyNeededBySatisfies(
      checker,
      parserServices.esTreeNodeToTSNodeMap,
    );

    const getLayerTypes = createGetLayerTypes(parserServices);

    return {
      CallExpression: (node) => {
        // Match `<object>.<method>(...)` where `<method>` is a mutating array
        // method with a non-mutating counterpart.
        const { callee } = node;

        if (
          callee.type !== AST_NODE_TYPES.MemberExpression ||
          callee.computed ||
          callee.property.type !== AST_NODE_TYPES.Identifier ||
          !MUTATING_METHOD_NAMES.has(callee.property.name)
        ) {
          return;
        }

        const methodName = callee.property.name;

        // Only argument shapes that the non-mutating counterpart can express
        // are targeted (e.g. `fill(v, start, end)` has no direct equivalent).
        switch (methodName) {
          case 'reverse':
            if (!Arr.isEmpty(node.arguments)) {
              return;
            }

            break;

          case 'sort':
            if (node.arguments.length > 1) {
              return;
            }

            break;

          case 'fill':
            if (!Arr.isFixedLengthArray(1, node.arguments)) {
              return;
            }

            break;

          case 'splice':
            if (
              !Arr.isFixedLengthArray(1, node.arguments) &&
              !Arr.isFixedLengthArray(2, node.arguments)
            ) {
              return;
            }

            break;

          default:
            return;
        }

        // The rewrites inspect or count the arguments.
        if (
          node.arguments.some(
            (argument) => argument.type === AST_NODE_TYPES.SpreadElement,
          )
        ) {
          return;
        }

        // The object must be a call of the shape `Array.from(<arg>)`, seen
        // through type wrappers: `(Array.from(xs) as number[]).sort()`.
        const inner = asNode(skipTypeWrappers(callee.object));

        const arg = matchArrayFromCall(inner);

        if (arg === undefined) {
          return;
        }

        // The argument must already be an array (not a `Set` / `Map` / iterable
        // where `Array.from()` is a genuine conversion, not a defensive copy) at
        // every type-wrapper layer: `s as unknown as number[]` is still a `Set`,
        // and `xs as Iterable<number>` is the author saying it may not be an
        // array.
        if (!getLayerTypes(arg).every(isArrayOrTupleType)) {
          return;
        }

        // Guard against a shadowed `Array` binding whose `.from()` does not
        // return an array: the real `Array.from(arrayLike)` is always an array.
        if (!getLayerTypes(callee.object).every(isArrayOrTupleType)) {
          return;
        }

        if (isCopyNeededBySatisfies(callee.object, inner, arg)) {
          return;
        }

        const sourceCode = context.sourceCode;

        // `getText` leaves out the parentheses around a comma expression, which
        // an argument list needs.
        const argsText = node.arguments
          .map((argument) =>
            argument.type === AST_NODE_TYPES.SequenceExpression
              ? `(${sourceCode.getText(argument)})`
              : sourceCode.getText(argument),
          )
          .join(', ');

        const replacement = ((): string | undefined => {
          switch (methodName) {
            case 'reverse':
              return 'toReversed()';

            case 'sort':
              return `toSorted(${argsText})`;

            case 'fill': {
              const fillValue = node.arguments[0];

              // `fill(v)` evaluates `v` once while `() => v` re-evaluates it per
              // element, so the rewrite is only offered for expressions that
              // are safe to re-evaluate.
              if (
                fillValue === undefined ||
                fillValue.type === AST_NODE_TYPES.SpreadElement ||
                !isSafeToReEvaluate(fillValue)
              ) {
                return undefined;
              }

              return `() => ${argsText}`;
            }

            case 'splice':
              return toSliceCall(node.arguments, argsText);
          }
        })();

        if (replacement === undefined) {
          return;
        }

        if (methodName === 'fill') {
          reportFill({ context, node, inner, arg, mapFunction: replacement });

          return;
        }

        // The two-argument `slice` is written from the numbers, not the source,
        // so a comment among the arguments would be dropped: then the call is
        // reported without a fix.
        const dropsComment =
          methodName === 'splice' &&
          Arr.isFixedLengthArray(2, node.arguments) &&
          sourceCode
            .getCommentsInside(node)
            .some(
              (comment) =>
                comment.range[0] > callee.property.range[1] &&
                comment.range[1] <= node.range[1],
            );

        // The `Array.from(...)` call and the `<method>(...)` part are replaced
        // separately, so that wrappers around the call and the `?.` between
        // them are kept.
        const fix = (
          fixer: TSESLint.RuleFixer,
        ): readonly TSESLint.RuleFix[] => [
          fixer.replaceText(
            inner,
            toMemberObjectText(sourceCode.getText(arg), arg.type),
          ),
          fixer.replaceTextRange(
            [callee.property.range[0], node.range[1]],
            replacement,
          ),
        ];

        const data = { mutatingMethod: methodName, replacement } as const;

        // `Array.from(xs)` copies `xs` before the arguments are evaluated, and
        // the replacement reads `xs` after them: an argument that may change
        // `xs` (`sort(cmpAfterPush())`) changes what the replacement reads.
        if (
          node.arguments.some((argument) => mayHaveEffect(argument, sourceCode))
        ) {
          context.report({
            node,
            messageId: 'preferNonMutatingMethodUnlessArgumentChangesArray',
            data,
            suggest: dropsComment
              ? []
              : [{ messageId: 'useNonMutatingMethod', data, fix }],
          });

          return;
        }

        context.report({
          node,
          messageId: 'preferNonMutatingMethod',
          data,
          fix: dropsComment ? null : fix,
        });
      },
    };
  },
} as const;
