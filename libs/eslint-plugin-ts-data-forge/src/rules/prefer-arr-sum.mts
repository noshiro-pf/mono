import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getArgumentText,
  skipTypeWrappers,
  typeWrapperLayers,
} from 'eslint-rule-forge';
import { Arr, pipe } from 'ts-data-forge';
import type { Type, TypeReference } from 'typescript';
import { tsDataForgeValueAt } from './import-binding.mjs';

type Options = readonly [];

type MessageIds = 'useArrSum' | 'useArrSumBy';

export const preferArrSum: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.reduce((a, b) => a + b, 0)` with `Arr.sum(xs)`, and `xs.reduce((acc, x) => acc + x.v, 0)` with `Arr.sumBy(xs, x => x.v)`, from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useArrSum: 'Replace with `Arr.sum({{arrayName}})` from ts-data-forge.',
      useArrSumBy:
        'Replace with `Arr.sumBy({{arrayName}}, {{mapper}})` from ts-data-forge.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const services = context.sourceCode.parserServices;

    const mut_nodesToFix: {
      node: TSESTree.CallExpression;
      arrayExpression: TSESTree.Expression;
      messageId: 'useArrSum' | 'useArrSumBy';
      mapper?: string;
    }[] = [];

    return {
      CallExpression: (node) => {
        // Check for xs.reduce(...)
        // (`xs[reduce]` calls whatever method the variable `reduce` names)
        if (
          node.callee.type !== AST_NODE_TYPES.MemberExpression ||
          node.callee.computed ||
          node.callee.property.type !== AST_NODE_TYPES.Identifier ||
          node.callee.property.name !== 'reduce'
        ) {
          return;
        }

        const arrayExpression = node.callee.object;

        // Check if we have 2 arguments: reducer function and initial value 0
        if (!Arr.isFixedLengthTuple(2, node.arguments)) {
          return;
        }

        const reducer = node.arguments[0];

        // The initial value and the operands of the body are read through type
        // wrappers: `0 as number` is still 0, `(b satisfies number)` is still
        // `b`. Types are asked of the values underneath too.
        const initialValue = skipTypeWrappers(node.arguments[1]);

        // Check initial value is 0
        if (
          initialValue.type !== AST_NODE_TYPES.Literal ||
          initialValue.value !== 0
        ) {
          return;
        }

        // Check if reducer is an arrow function with 2 parameters
        if (
          reducer.type !== AST_NODE_TYPES.ArrowFunctionExpression ||
          !Arr.isFixedLengthTuple(2, reducer.params)
        ) {
          return;
        }

        const [param1, param2] = reducer.params;

        if (
          param1.type !== AST_NODE_TYPES.Identifier ||
          param2.type !== AST_NODE_TYPES.Identifier
        ) {
          return;
        }

        const body = reducer.body;

        const checker = services?.program?.getTypeChecker();

        if (checker === undefined) {
          return;
        }

        if (
          body.type !== AST_NODE_TYPES.BinaryExpression ||
          body.operator !== '+'
        ) {
          return;
        }

        const left = skipTypeWrappers(body.left);

        const right = skipTypeWrappers(body.right);

        // Case 1: (a, b) => a + b
        if (
          left.type === AST_NODE_TYPES.Identifier &&
          left.name === param1.name &&
          right.type === AST_NODE_TYPES.Identifier &&
          right.name === param2.name
        ) {
          // Check if arrayExpression type is number[] or compatible at every
          // layer of type wrappers: a cast does not turn strings, which `+`
          // concatenates, into numbers.
          const isNumberArray = (
            // AST nodes hold mutable child arrays, so they are not deeply readonly.
            // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
            expression: TSESTree.Node,
          ): boolean => {
            const type = pipe(
              services?.esTreeNodeToTSNodeMap?.get(expression),
            ).mapNullable((tsNode) => checker.getTypeAtLocation(tsNode)).value;

            if (
              type === undefined || // Check if it's an array type or tuple type
              (!checker.isArrayType(type) && !checker.isTupleType(type))
            ) {
              return false;
            }

            // Get type arguments using the official API
            // TypeReference has typeArguments that we can access
            const typeArguments = checker.getTypeArguments(
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              type as TypeReference,
            );

            // Check if element type is assignable to number
            return (
              Arr.isNonEmpty(typeArguments) &&
              checker.isTypeAssignableTo(
                typeArguments[0],
                checker.getNumberType(),
              )
            );
          };

          if (typeWrapperLayers(arrayExpression).every(isNumberArray)) {
            mut_nodesToFix.push({
              node,
              arrayExpression,
              messageId: 'useArrSum',
            });
          }

          return;
        }

        // Case 2: (acc, x) => acc + x.prop, or x.prop + acc. The first
        // parameter is the running total, a number, so a property is read of
        // the second, the element: a path of non-computed or string-literal
        // keys, which names neither the total nor anything else, and whose text
        // the mapper keeps, wrappers included.
        const [accSide, elementSide] =
          left.type === AST_NODE_TYPES.Identifier && left.name === param1.name
            ? [left, body.right]
            : right.type === AST_NODE_TYPES.Identifier &&
                right.name === param1.name
              ? [right, body.left]
              : [undefined, undefined];

        // The type of an expression, as the checker gives it.
        const typeOf = (
          // AST nodes hold mutable child arrays, so they are not deeply readonly.
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          expression: TSESTree.Node,
        ): Type | undefined =>
          pipe(services?.esTreeNodeToTSNodeMap?.get(expression)).mapNullable(
            (tsNode) => checker.getTypeAtLocation(tsNode),
          ).value;

        // Whether a layer of the receiver is not an array or a tuple.
        const isNotArrayOrTuple = (
          // AST nodes hold mutable child arrays, so they are not deeply readonly.
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          layer: TSESTree.Node,
        ): boolean => {
          const type = typeOf(layer);

          return (
            type === undefined ||
            (!checker.isArrayType(type) && !checker.isTupleType(type))
          );
        };

        // Whether a layer of the element's side is not assignable to number.
        const isNotNumber = (
          // AST nodes hold mutable child arrays, so they are not deeply readonly.
          // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
          layer: TSESTree.Node,
        ): boolean => {
          const type = typeOf(layer);

          return (
            type === undefined ||
            !checker.isTypeAssignableTo(type, checker.getNumberType())
          );
        };

        if (
          accSide === undefined ||
          !isMemberPathOf(elementSide, param2.name) ||
          typeWrapperLayers(arrayExpression).some(isNotArrayOrTuple) ||
          typeWrapperLayers(elementSide).some(isNotNumber)
        ) {
          return;
        }

        mut_nodesToFix.push({
          node,
          arrayExpression,
          messageId: 'useArrSumBy',
          mapper: `${param2.name} => ${sourceCode.getText(elementSide)}`,
        });
      },
      'Program:exit': () => {
        const arrAt = tsDataForgeValueAt(sourceCode, 'Arr');

        for (const nodeInfo of mut_nodesToFix) {
          const arrayText = getArgumentText(
            sourceCode,
            nodeInfo.arrayExpression,
          );

          const arr = arrAt(nodeInfo.node);

          context.report({
            node: nodeInfo.node,
            messageId: nodeInfo.messageId,
            data: {
              arrayName: arrayText,
              mapper: nodeInfo.mapper ?? '',
            },
            fix:
              arr === undefined
                ? null
                : (fixer) => {
                    const replacement =
                      nodeInfo.messageId === 'useArrSum'
                        ? `${arr.localName}.sum(${arrayText})`
                        : `${arr.localName}.sumBy(${arrayText}, ${nodeInfo.mapper})`;

                    return [
                      ...arr.edits(fixer),
                      fixer.replaceText(nodeInfo.node, replacement),
                    ];
                  },
          });
        }
      },
    };
  },
} as const;

/**
 * Whether `node` is a property path of the identifier `name`: member accesses
 * with a non-computed key or a string-literal one, read through type wrappers
 * at any depth (`x.v`, `x['v']`, `x.w.n`, `x!.v`, `(x.v satisfies number)`).
 */
const isMemberPathOf = (
  // AST nodes hold mutable child arrays, so they are not deeply readonly.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  name: string,
): boolean => {
  const inner = skipTypeWrappers(node);

  if (inner.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }

  const keyIsName = inner.computed
    ? inner.property.type === AST_NODE_TYPES.Literal &&
      typeof inner.property.value === 'string'
    : inner.property.type === AST_NODE_TYPES.Identifier;

  if (!keyIsName) {
    return false;
  }

  const object = skipTypeWrappers(inner.object);

  return (
    (object.type === AST_NODE_TYPES.Identifier && object.name === name) ||
    isMemberPathOf(object, name)
  );
};
