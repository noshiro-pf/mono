import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';
import { isTypeWrapper, skipTypeWrappers } from '../../ast-utils/index.mjs';
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
 *
 * The `Array.from()` call is found through type wrappers, which the fix keeps
 * (`(Array.from(xs) as T[]).sort()` → `(xs as T[]).toSorted()`), and the
 * argument's type is that of its value, not of a cast around it.
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
            if (!Arr.isEmpty(node.arguments)) {
              return;
            }

            break;

          case 'sort':
            if (node.arguments.length > 1) {
              return;
            }

            break;

          case 'splice':
            if (Arr.isEmpty(node.arguments)) {
              return;
            }

            break;

          case 'fill':
            if (!Arr.isFixedLengthArray(1, node.arguments)) {
              return;
            }

            break;

          default:
            return;
        }

        if (
          methodName !== 'splice' &&
          node.arguments.some(
            (argument) => argument.type === AST_NODE_TYPES.SpreadElement,
          )
        ) {
          // `toSpliced(...args)` keeps spread arguments as-is; the other
          // rewrites need to inspect / count the arguments.
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
        // where `Array.from()` is a genuine conversion, not a defensive copy).
        // The value's own type is asked: `s as unknown as number[]` is still a
        // `Set`.
        const argType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(
            asNode(skipTypeWrappers(arg)),
          ),
        );

        if (!isArrayOrTupleType(argType)) {
          return;
        }

        // Guard against a shadowed `Array` binding whose `.from()` does not
        // return an array: the real `Array.from(arrayLike)` is always an array.
        const innerType = checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(inner),
        );

        if (!isArrayOrTupleType(innerType)) {
          return;
        }

        const sourceCode = context.sourceCode;

        // `getText` leaves out the parentheses around a comma expression,
        // which an argument list needs.
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

        if (replacement === undefined) {
          return;
        }

        context.report({
          node,
          messageId: 'preferNonMutatingMethod',
          data: { mutatingMethod: methodName, replacement },
          // The `Array.from(...)` call and the `<method>(...)` part are
          // replaced separately, so that wrappers around the call and the
          // `?.` between them are kept.
          fix: (fixer) => {
            const objectText = toMemberObjectText(
              sourceCode.getText(arg),
              arg.type,
            );

            return [
              fixer.replaceText(inner, objectText),
              fixer.replaceTextRange(
                [callee.property.range[0], node.range[1]],
                replacement,
              ),
            ];
          },
        });
      },
    };
  },
  defaultOptions: [],
} as const;

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;
