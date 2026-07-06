import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createIsArrayOrTupleType,
  matchArrayFromCall,
  toMemberObjectText,
} from './array-type-utils.mjs';

type Options = readonly [];

type MessageIds = 'preferNonMutatingMethod';

/**
 * Mutating array methods that have a non-mutating counterpart usable when the
 * receiver is a throw-away `Array.from()` copy of an array:
 *
 * - `Array.from(xs).reverse()` → `xs.toReversed()`
 * - `Array.from(xs).sort(cmp?)` → `xs.toSorted(cmp?)`
 * - `Array.from(xs).splice(...args)` → `xs.toSpliced(...args)`
 * - `Array.from(xs).fill(v)` → `xs.map(() => v)`
 *
 * Note on `splice`: `splice` returns the *removed* elements while `toSpliced`
 * returns the spliced copy, so the rewrite is not value-preserving when the
 * expression result is used as the removed elements. Code of the shape
 * `Array.from(xs).splice(...)` is treated as intending the copy semantics
 * (otherwise the defensive copy is dead), which is exactly `toSpliced`.
 */
const MUTATING_METHOD_NAMES: ReadonlySet<string> = new Set([
  'fill',
  'reverse',
  'sort',
  'splice',
]);

/**
 * Expressions that are safe to re-evaluate once per element inside a `map`
 * callback: re-reading them cannot trigger side effects and always yields the
 * same value, so `Array.from(xs).fill(v)` → `xs.map(() => v)` is behavior
 * preserving. Anything that may allocate (`{}`, `new Foo()`), call code, or hit
 * a getter is excluded — for those, `fill` shares one value across all slots
 * while `map` would create one per slot.
 */
const isSafeToReEvaluate = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): boolean => {
  if (
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.ThisExpression ||
    node.type === AST_NODE_TYPES.Literal
  ) {
    return true;
  }

  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    return node.expressions.length === 0;
  }

  if (node.type === AST_NODE_TYPES.UnaryExpression) {
    return (
      (node.operator === '-' || node.operator === '+') &&
      node.argument.type === AST_NODE_TYPES.Literal
    );
  }

  return false;
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
    schema: [],
    messages: {
      preferNonMutatingMethod:
        'Mutating a throw-away `Array.from()` copy with `{{mutatingMethod}}` is roundabout. Use `{{replacement}}` on the original array instead.',
    },
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    const isArrayOrTupleType = createIsArrayOrTupleType(checker);

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
            if (node.arguments.length !== 0) return;

            break;

          case 'sort':
            if (node.arguments.length > 1) return;

            break;

          case 'splice':
            if (node.arguments.length === 0) return;

            break;

          case 'fill':
            if (node.arguments.length !== 1) return;

            break;

          default:
            return;
        }

        if (
          node.arguments.some(
            (argument) => argument.type === AST_NODE_TYPES.SpreadElement,
          ) &&
          methodName !== 'splice'
        ) {
          // `toSpliced(...args)` keeps spread arguments as-is; the other
          // rewrites need to inspect / count the arguments.
          return;
        }

        // The object must be a call of the shape `Array.from(<arg>)`.
        const inner = callee.object;

        const arg = matchArrayFromCall(inner);

        if (arg === undefined) return;

        // The argument must already be an array (not a `Set` / `Map` / iterable
        // where `Array.from()` is a genuine conversion, not a defensive copy).
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

        const sourceCode = context.sourceCode;

        const argsText = node.arguments
          .map((argument) => sourceCode.getText(argument))
          .join(', ');

        const replacement = ((): string | undefined => {
          switch (methodName) {
            case 'reverse':
              return 'toReversed()';

            case 'sort':
              return `toSorted(${argsText})`;

            case 'splice':
              return `toSpliced(${argsText})`;

            case 'fill': {
              const fillValue = node.arguments[0];

              // `fill(v)` evaluates `v` once while `map(() => v)` re-evaluates
              // it per element, so the rewrite is only offered for expressions
              // that are safe to re-evaluate.
              if (
                fillValue === undefined ||
                fillValue.type === AST_NODE_TYPES.SpreadElement ||
                !isSafeToReEvaluate(fillValue)
              ) {
                return undefined;
              }

              return `map(() => ${argsText})`;
            }
          }
        })();

        if (replacement === undefined) return;

        context.report({
          node,
          messageId: 'preferNonMutatingMethod',
          data: { mutatingMethod: methodName, replacement },
          fix: (fixer) => {
            const objectText = toMemberObjectText(
              sourceCode.getText(arg),
              arg.type,
            );

            return fixer.replaceText(node, `${objectText}.${replacement}`);
          },
        });
      },
    };
  },
  defaultOptions: [],
} as const;
