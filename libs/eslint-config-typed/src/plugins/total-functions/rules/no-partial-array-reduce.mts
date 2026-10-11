import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { isTupleType, isTupleTypeReference, unionTypeParts } from 'tsutils';
import type { Type } from 'typescript';
import { createRule } from './common.mjs';
import {
  typeWrapperLayers,
  withoutTypeWrappers,
} from './type-wrapper-layers.mjs';

/**
 * An ESLint rule to ban partial Array.prototype.reduce().
 *
 * The callee, its receiver and a computed key are read through `as`,
 * `satisfies`, `!` and `<T>`: the receiver is an array, and the key is
 * `reduce`, if the type at any wrapper layer says so, and the receiver is
 * non-empty only if its own type — not a cast — says so.
 */

export const noPartialArrayReduce = createRule({
  name: 'no-partial-array-reduce',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans partial Array.prototype.reduce()',
    },
    messages: {
      errorStringGeneric:
        'Array.prototype.reduce() is partial. It will throw if the array is empty. Provide an initial value or prove the array is non-empty to prevent this error.',
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    const typePartsOf = (expression: TSESTree.Expression): readonly Type[] =>
      unionTypeParts(
        checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(expression),
        ),
      );

    return {
      CallExpression: (node) => {
        // We only care if this call is a member expression.
        // `xs.reduce!(f)` and `(xs.reduce satisfies unknown)(f)` call the
        // same method.

        const callee = withoutTypeWrappers(node.callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const object = withoutTypeWrappers(callee.object);

        // Non-empty array literal are safe.

        if (
          object.type === AST_NODE_TYPES.ArrayExpression &&
          object.elements[0] !== undefined &&
          object.elements[0]?.type !== AST_NODE_TYPES.SpreadElement
        ) {
          return;
        }

        // We only care if this call has exactly one argument.

        if (!Arr.isFixedLengthArray(1, node.arguments)) {
          return;
        }

        // We only care if this call is on an array or tuple (or a type that is
        // a union that includes one or more arrays or tuples) — as the value's
        // own type or as any type it is asserted to have on the way.

        if (
          typeWrapperLayers(callee.object).every((layer) =>
            typePartsOf(layer).every(
              (t) =>
                !(
                  checker.isArrayType(t) ||
                  isTupleType(t) ||
                  isTupleTypeReference(t)
                ),
            ),
          )
        ) {
          return;
        }

        // Only the value's own type proves it non-empty: a cast to a non-empty
        // tuple vouches for nothing.
        const typeParts = typePartsOf(object);

        const isProvablyNonEmpty = typeParts.every(
          (t) =>
            (isTupleType(t) && t.minLength >= 1) ||
            (isTupleTypeReference(t) && t.target.minLength >= 1),
        );

        if (isProvablyNonEmpty) {
          return;
        }

        const unsafeMethods: readonly string[] = [
          'reduce',
          'reduceRight',
        ] as const;

        // Detect this form:
        // [].reduce(() => "")
        //
        // Or this form:
        // []["reduce"](() => "")
        //
        // Or this form:
        // const n = "reduce" as const;
        // const foo = [][n](() => "");
        //
        // Or this form:
        // declare const n: "reduce" | "reduceRight";
        // const foo = [""][n](() => "");
        //
        // A computed key is read through its type wrappers
        // (`[]["reduce" satisfies string]`, `[][n!]`), and is a reduce if the
        // type at any of them says it may be.
        const isReduce = callee.computed
          ? typeWrapperLayers(callee.property).some((key) =>
              key.type === AST_NODE_TYPES.Literal
                ? typeof key.value === 'string' &&
                  unsafeMethods.includes(key.value)
                : typePartsOf(key).some(
                    (type) =>
                      type.isStringLiteral() &&
                      unsafeMethods.includes(type.value),
                  ),
            )
          : callee.property.type === AST_NODE_TYPES.Identifier &&
            unsafeMethods.includes(callee.property.name);

        if (!isReduce) {
          return;
        }

        context.report({
          node,
          messageId: 'errorStringGeneric',
        } as const);
      },
    };
  },
  defaultOptions: [],
} as const);
