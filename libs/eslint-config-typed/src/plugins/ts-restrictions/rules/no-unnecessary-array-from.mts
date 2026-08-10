import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
} from '@typescript-eslint/utils';
import {
  createIsArrayOrTupleType,
  matchArrayFromCall,
  toMemberObjectText,
} from './array-type-utils.mjs';

type Options = readonly [];

type MessageIds = 'unnecessaryArrayFrom';

/**
 * Non-mutating array methods that already return a brand-new array regardless of
 * the receiver's identity (the ES2023 "change array by copy" methods). When the
 * receiver is already an array, wrapping it in `Array.from()` beforehand only
 * creates a throw-away intermediate copy, so `Array.from(x).toSorted()` is
 * equivalent to `x.toSorted()`.
 *
 * Mutating counterparts (`sort`, `reverse`, `splice`, …) are intentionally
 * excluded: there the `Array.from()` copy is meaningful because it protects the
 * original array from being mutated in place.
 */
const NON_MUTATING_ARRAY_METHODS: ReadonlySet<string> = new Set([
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

export const noUnnecessaryArrayFrom: TSESLint.RuleModule<MessageIds, Options> =
  {
    meta: {
      type: 'suggestion',
      docs: {
        description:
          'Disallow wrapping an array in `Array.from()` before a non-mutating array method (e.g. `Array.from(x).toSorted()`), since the method already returns a new array',
      },
      fixable: 'code',
      schema: [],
      messages: {
        unnecessaryArrayFrom:
          '`Array.from()` is unnecessary here because `{{methodName}}` already returns a new array. Call `.{{methodName}}()` directly on the array.',
      },
    },

    create: (context) => {
      const parserServices = ESLintUtils.getParserServices(context);

      const checker = parserServices.program.getTypeChecker();

      const isArrayOrTupleType = createIsArrayOrTupleType(checker);

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

          // The object must be a call of the shape `Array.from(<arg>)`.
          const inner = callee.object;

          const arg = matchArrayFromCall(inner);

          if (arg === undefined) return;

          // The argument must already be an array (not a `Set` / `Map` / iterable
          // that genuinely needs `Array.from()` to become an array).
          const argType = checker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(arg),
          );

          if (!isArrayOrTupleType(argType)) return;

          // Guard against a shadowed `Array` binding whose `.from()` does not
          // return an array: the real `Array.from(arrayLike)` is always an array.
          const innerType = checker.getTypeAtLocation(
            parserServices.esTreeNodeToTSNodeMap.get(inner),
          );

          if (!isArrayOrTupleType(innerType)) return;

          context.report({
            node: inner,
            messageId: 'unnecessaryArrayFrom',
            data: { methodName: callee.property.name },
            fix: (fixer) => {
              const argText = context.sourceCode.getText(arg);

              // Wrap low-precedence expressions (e.g. a conditional) in
              // parentheses so the inlined `<arg>.toSorted()` keeps its meaning.
              const objectText = toMemberObjectText(argText, arg.type);

              return fixer.replaceText(inner, objectText);
            },
          });
        },
      };
    },
    defaultOptions: [],
  } as const;
