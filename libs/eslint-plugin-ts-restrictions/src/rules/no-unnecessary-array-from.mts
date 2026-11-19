import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
} from '@typescript-eslint/utils';
import {
  asNode,
  createGetLayerTypes,
  mayHaveEffect,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import {
  createIsArrayOrTupleType,
  createIsCopyNeededBySatisfies,
  matchArrayFromCall,
  toMemberObjectText,
} from './array-type-utils.mjs';

type Options = readonly [];

type MessageIds =
  | 'unnecessaryArrayFrom'
  | 'unnecessaryArrayFromUnlessMutated'
  | 'removeArrayFrom';

/**
 * Array methods that do not change the array they are called on. When the
 * receiver is already an array, wrapping it in `Array.from()` beforehand only
 * creates an intermediate copy, so `Array.from(x).toSorted()` is equivalent to
 * `x.toSorted()` — unless the method runs code of the author's while it reads
 * the array ({@link READS_RECEIVER_WHILE_USER_CODE_RUNS}).
 *
 * Mutating counterparts (`sort`, `reverse`, `splice`, …) are intentionally
 * excluded: there the `Array.from()` copy is meaningful because it protects the
 * original array from being mutated in place.
 *
 * The `Array.from()` call is found through type wrappers, which the fix keeps
 * (`(Array.from(x) satisfies T).toSorted()` → `(x satisfies T).toSorted()`), and the
 * argument's type is that of its value, not of a cast around it. A `satisfies`
 * around the call that the argument itself does not meet keeps the copy:
 * `(Array.from(xs) satisfies number[])` with `xs: readonly number[]` would not
 * type-check as `xs satisfies number[]`.
 */
const NON_MUTATING_ARRAY_METHODS: ReadonlySet<string> = new Set<string>([
  'at',
  'concat',
  // 'constructor',
  // 'copyWithin' (mutating),
  'entries',
  'every',
  // 'fill' (mutating),
  'filter',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  // 'length' (property, not a method; never matches a call expression),
  'map',
  // 'pop' (mutating),
  // 'push' (mutating),
  'reduce',
  'reduceRight',
  // 'reverse' (mutating),
  // 'shift' (mutating),
  'slice',
  'some',
  // 'sort' (mutating),
  // 'splice' (mutating),
  'toLocaleString',
  'toReversed',
  'toSorted',
  'toSpliced',
  'toString',
  // 'unshift' (mutating),
  'values',
  'with',
]);

/**
 * The methods of {@link NON_MUTATING_ARRAY_METHODS} that read the array while
 * code of the author's runs: those that call back once per element, those that
 * return an iterator which reads it later, and those that turn each element
 * into a string (`join`, `toString`, `toLocaleString`), which runs the
 * element's own `toString`. There the copy can be what keeps the reading stable
 * — a snapshot of a listener list whose listeners remove themselves — so
 * removing it is only suggested. The others read the array before any such code
 * runs on a plain array (`toSorted` copies before its comparator is called) and are fixed,
 * unless an argument may have an effect: the copy is taken before the arguments
 * run, the array itself is read after them.
 */
const READS_RECEIVER_WHILE_USER_CODE_RUNS: ReadonlySet<string> =
  new Set<string>([
    'entries',
    'every',
    'filter',
    'find',
    'findIndex',
    'findLast',
    'findLastIndex',
    'flatMap',
    'forEach',
    'join',
    'keys',
    'map',
    'reduce',
    'reduceRight',
    'some',
    'toLocaleString',
    'toString',
    'values',
  ]);

export const noUnnecessaryArrayFrom: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Disallow wrapping an array in `Array.from()` before an array method that does not change it (e.g. `Array.from(x).toSorted()`); only suggested where code can change the array before or while the method reads it (a callback, an iterator, the `toString` of an element, an argument with an effect)',
      },
      fixable: 'code',
      hasSuggestions: true,
      schema: [],
      messages: {
        unnecessaryArrayFrom:
          '`Array.from()` is unnecessary here because `{{methodName}}` does not change the array it is called on. Call `.{{methodName}}()` directly on the array.',
        unnecessaryArrayFromUnlessMutated:
          '`Array.from()` is unnecessary here because `{{methodName}}` does not change the array it is called on, unless the copy is there because the array changes before or while `{{methodName}}` reads it. Call `.{{methodName}}()` directly on the array if it does not.',
        removeArrayFrom: 'Remove the `Array.from()` copy.',
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
          // Match `<object>.<method>(...)` where `<method>` is a non-mutating
          // array method.
          const { callee } = node;

          if (
            callee.type !== AST_NODE_TYPES.MemberExpression ||
            callee.computed ||
            callee.property.type !== AST_NODE_TYPES.Identifier ||
            !NON_MUTATING_ARRAY_METHODS.has(callee.property.name)
          ) {
            return;
          }

          // The object must be a call of the shape `Array.from(<arg>)`, seen
          // through type wrappers: `(Array.from(xs) satisfies T).toSorted()`.
          const inner = asNode(skipTypeWrappers(callee.object));

          const arg = matchArrayFromCall(inner);

          if (arg === undefined) {
            return;
          }

          // The argument must already be an array (not a `Set` / `Map` / iterable
          // that genuinely needs `Array.from()` to become an array) at every
          // type-wrapper layer: `s as unknown as number[]` is still a `Set`, and
          // `xs as Iterable<number>` is the author saying it may not be an array.
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

          const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix =>
            // Wrap low-precedence expressions (e.g. a conditional) in
            // parentheses so the inlined `<arg>.toSorted()` keeps its meaning.
            fixer.replaceText(
              inner,
              toMemberObjectText(context.sourceCode.getText(arg), arg.type),
            );

          const data = { methodName: callee.property.name } as const;

          if (
            READS_RECEIVER_WHILE_USER_CODE_RUNS.has(callee.property.name) ||
            node.arguments.some((argument) =>
              mayHaveEffect(argument, context.sourceCode),
            )
          ) {
            context.report({
              node: inner,
              messageId: 'unnecessaryArrayFromUnlessMutated',
              data,
              suggest: [{ messageId: 'removeArrayFrom', fix }],
            });
          } else {
            context.report({
              node: inner,
              messageId: 'unnecessaryArrayFrom',
              data,
              fix,
            });
          }
        },
      };
    },
  } as const;
