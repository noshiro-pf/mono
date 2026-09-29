import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { createRule, typeSymbolName } from './common.mjs';
import {
  typeWrapperLayers,
  withoutTypeWrappers,
} from './type-wrapper-layers.mjs';

/**
 * An ESLint rule to ban the partial URL construction.
 *
 * The constructor and literal arguments are read through `as`, `satisfies`,
 * `!` and `<T>`: the constructor is URL's if the type at any wrapper layer
 * says so.
 */

export const noPartialUrlConstructor = createRule({
  name: 'no-partial-url-constructor',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans the partial URL construction.',
    },
    messages: {
      errorStringWillDefinitelyThrow:
        'This invalid URL constructor will throw a TypeError at runtime.',
      errorStringGeneric:
        "Don't use the URL constructor directly because it can throw and because URLs are mutable. Instead, use `readonlyURL` from the readonly-types package.",
    },
    schema: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    return {
      NewExpression: (node) => {
        if (Arr.isEmpty(node.arguments) || node.arguments.length > 2) {
          // TypeScript will catch this case.
          return;
        }

        // The constructor is a URL if the type at any wrapper layer says so:
        // `new (URL as new (url: string) => URL)(input)` still runs URL's.
        const isUrlConstructor = typeWrapperLayers(node.callee).some(
          (layer) => {
            const objectNode = parserServices.esTreeNodeToTSNodeMap.get(layer);

            const objectType = checker.getTypeAtLocation(objectNode);

            const prototype = checker.getPropertyOfType(
              objectType,
              'prototype',
            );

            const prototypeType =
              prototype !== undefined
                ? checker.getTypeOfSymbolAtLocation(prototype, objectNode)
                : undefined;

            return (
              prototypeType !== undefined &&
              typeSymbolName(prototypeType) === 'URL'
            );
          },
        );

        if (isUrlConstructor) {
          // A literal argument is read through its type wrappers.
          const literals = node.arguments.map((argument) => {
            if (argument.type === AST_NODE_TYPES.SpreadElement) {
              return undefined;
            }

            const value = withoutTypeWrappers(argument);

            return value.type === AST_NODE_TYPES.Literal &&
              typeof value.value === 'string'
              ? value.value
              : undefined;
          });

          if (
            Arr.isFixedLengthArray(1, node.arguments) &&
            Arr.isFixedLengthArray(1, literals) &&
            literals[0] !== undefined
          ) {
            if (!isValidUrl(literals[0])) {
              context.report({
                node: node.arguments[0],
                messageId: 'errorStringWillDefinitelyThrow',
              } as const);
            }

            return;
          }

          if (
            Arr.isFixedLengthArray(2, literals) &&
            literals[0] !== undefined &&
            literals[1] !== undefined
          ) {
            if (!isValidUrl(literals[0], literals[1])) {
              context.report({
                node,
                messageId: 'errorStringWillDefinitelyThrow',
              } as const);
            }

            return;
          }

          context.report({
            node,
            messageId: 'errorStringGeneric',
          } as const);
        }
      },
    };
  },
  defaultOptions: [],
} as const);

const isValidUrl = (s: string, base?: string): boolean => {
  try {
    // eslint-disable-next-line no-new
    new URL(s, base);

    return true;
  } catch {
    return false;
  }
};
