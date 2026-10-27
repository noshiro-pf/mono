import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers, typeWrapperLayers } from 'eslint-rule-forge';
import {
  isTypeAssignableToString,
  isTypeFlagSet,
  unionTypeParts,
} from 'tsutils';
import { type Type, TypeFlags } from 'typescript';
import { createRule } from './common.mjs';

/**
 * An ESLint rule to ban partial String.prototype.normalize().
 *
 * The callee, its receiver, a computed key and the argument are read through
 * `as`, `satisfies`, `!` and `<T>`: the receiver is a string, and the key is
 * `normalize`, if the type at any wrapper layer says so, and the argument is a
 * safe form only if its own type — not a cast — says so.
 */

export const noPartialStringNormalize = createRule({
  name: 'no-partial-string-normalize',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans partial String.prototype.normalize()',
    },
    messages: {
      errorStringGeneric:
        'String.prototype.normalize() is partial. Wrap it in a wrapper that catches the error and returns undefined.',
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    const typeOf = (expression: TSESTree.Expression): Type =>
      checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(expression),
      );

    /**
     * `true` when every value `node` may evaluate to is one of the four forms
     * or `undefined`, by the type of the value itself. A conditional or
     * logical expression is judged by its operands, so a cast in one of them
     * (`cond ? 'NFC' : (form as 'NFD')`) cannot vouch for it as the type of
     * the whole would.
     */
    const isSafeForm = (node: TSESTree.Expression): boolean => {
      const expression = skipTypeWrappers(node);

      if (expression.type === AST_NODE_TYPES.ConditionalExpression) {
        return (
          isSafeForm(expression.consequent) && isSafeForm(expression.alternate)
        );
      }

      if (expression.type === AST_NODE_TYPES.LogicalExpression) {
        return isSafeForm(expression.left) && isSafeForm(expression.right);
      }

      return unionTypeParts(typeOf(expression)).every(
        (type) =>
          (type.isStringLiteral() && SAFE_FORMS.has(type.value)) ||
          isTypeFlagSet(type, TypeFlags.Undefined),
      );
    };

    return {
      CallExpression: (node) => {
        // We only care if this call is a member expression.
        // `s.normalize!(f)` and `(s.normalize satisfies unknown)(f)` call the
        // same method.

        const callee = skipTypeWrappers(node.callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        // We only care if this call is on a string object — as the value's
        // own type or as any type it is asserted to have on the way.

        if (
          typeWrapperLayers(callee.object).every(
            (layer) => !isTypeAssignableToString(checker, typeOf(layer)),
          )
        ) {
          return;
        }

        // Detect this form:
        // "".normalize("")
        //
        // Or this form:
        // ""["normalize"]("")
        //
        // Or this form:
        // const n = "normalize" as const;
        // const foo = ""[n]("");
        //
        // Or this form:
        // const n: "normalize" | "includes" = ...;
        // const foo = ""[n]("");
        //
        // A computed key is read through its type wrappers
        // (`""["normalize" satisfies string]`, `""[n!]`), and is a normalize
        // if the type at any of them says it may be.
        const isNormalize = callee.computed
          ? typeWrapperLayers(callee.property).some((key) =>
              key.type === AST_NODE_TYPES.Literal
                ? key.value === 'normalize'
                : unionTypeParts(typeOf(key)).some(
                    (type) =>
                      type.isStringLiteral() && type.value === 'normalize',
                  ),
            )
          : callee.property.type === AST_NODE_TYPES.Identifier &&
            callee.property.name === 'normalize';

        // We only care if this call is to the normalize method.

        if (!isNormalize) {
          return;
        }

        if (node.arguments.length > 1) {
          // This is a compiler error so don't bother flagging it.
          return;
        }

        const rawArgument = node.arguments[0];

        if (rawArgument === undefined) {
          // We only care if the caller provides an argument.
          // Zero arguments (`"".normalize()`) is always safe.
          return;
        }

        // TODO errorStringWillDefinitelyThrow
        if (
          rawArgument.type !== AST_NODE_TYPES.SpreadElement &&
          isSafeForm(rawArgument)
        ) {
          return;
        }

        // Anything else risks throwing an error so flag it.

        context.report({
          node,
          messageId: 'errorStringGeneric',
        } as const);
      },
    };
  },
  defaultOptions: [],
} as const);

const SAFE_FORMS: ReadonlySet<string> = new Set<string>([
  'NFC',
  'NFD',
  'NFKC',
  'NFKD',
]);
