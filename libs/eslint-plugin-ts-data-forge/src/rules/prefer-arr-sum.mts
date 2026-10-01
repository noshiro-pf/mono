import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr, pipe } from 'ts-data-forge';
import { type TypeReference } from 'typescript';
import { skipTypeWrappers, toArgumentText } from './ast-utils.mjs';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useArrSum' | 'useArrSumBy';

export const preferArrSum: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.reduce((a, b) => a + b, 0)` with `Arr.sum(xs)` or `Arr.sumBy(xs, fn)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useArrSum: 'Replace with `Arr.sum({{arrayName}})` from ts-data-forge.',
      useArrSumBy:
        'Replace with `Arr.sumBy({{arrayName}}, {{mapper}})` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

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

        // The initial value and the operands of the body are read through
        // type wrappers: `0 as number` is still 0, `(b satisfies number)` is
        // still `b`. Types are asked of the values underneath too.
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
          // Check if arrayExpression type is number[] or compatible, both as
          // written and under any wrapper: a cast does not turn strings,
          // which `+` concatenates, into numbers.
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

          if (
            isNumberArray(arrayExpression) &&
            isNumberArray(skipTypeWrappers(arrayExpression))
          ) {
            mut_nodesToFix.push({
              node,
              arrayExpression,
              messageId: 'useArrSum',
            });
          }

          return;
        }

        // Case 2: (a, b) => a.prop + b.prop or a['prop'] + b['prop']
        if (
          left.type === AST_NODE_TYPES.MemberExpression &&
          right.type === AST_NODE_TYPES.MemberExpression
        ) {
          const leftObj = skipTypeWrappers(left.object);

          const rightObj = skipTypeWrappers(right.object);

          if (
            leftObj.type !== AST_NODE_TYPES.Identifier ||
            leftObj.name !== param1.name ||
            rightObj.type !== AST_NODE_TYPES.Identifier ||
            rightObj.name !== param2.name
          ) {
            return;
          }

          // Check if both access the same property
          const leftProp = left.property;

          const rightProp = right.property;

          let mut_propName: string | undefined;

          if (
            leftProp.type === AST_NODE_TYPES.Identifier &&
            !left.computed &&
            rightProp.type === AST_NODE_TYPES.Identifier &&
            !right.computed &&
            leftProp.name === rightProp.name
          ) {
            mut_propName = leftProp.name;
          } else if (
            leftProp.type === AST_NODE_TYPES.Literal &&
            left.computed &&
            rightProp.type === AST_NODE_TYPES.Literal &&
            right.computed &&
            leftProp.value === rightProp.value &&
            typeof leftProp.value === 'string'
          ) {
            mut_propName = leftProp.value;
          }

          if (mut_propName === undefined) {
            return;
          }

          // Check if property type is number
          if (services?.program !== undefined && services.program !== null) {
            const tsLeftProp = services.esTreeNodeToTSNodeMap?.get(left);

            const tsRightProp = services.esTreeNodeToTSNodeMap?.get(right);

            if (tsLeftProp !== undefined && tsRightProp !== undefined) {
              const leftPropType = checker.getTypeAtLocation(tsLeftProp);

              const rightPropType = checker.getTypeAtLocation(tsRightProp);

              const numberType = checker.getNumberType();

              // Check if property type is assignable to number
              if (
                !checker.isTypeAssignableTo(leftPropType, numberType) ||
                !checker.isTypeAssignableTo(rightPropType, numberType)
              ) {
                return;
              }
            }
          }

          // Generate mapper function
          const mapperParam = param1.name;

          const mapper = left.computed
            ? `${mapperParam} => ${mapperParam}['${mut_propName}']`
            : `${mapperParam} => ${mapperParam}.${mut_propName}`;

          mut_nodesToFix.push({
            node,
            arrayExpression,
            messageId: 'useArrSumBy',
            mapper,
          });
        }
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImport);

        const hasArrImport = namedImports.includes('Arr');

        for (const [index, nodeInfo] of mut_nodesToFix.entries()) {
          const arrayText = toArgumentText(
            nodeInfo.arrayExpression,
            sourceCode,
          );

          context.report({
            node: nodeInfo.node,
            messageId: nodeInfo.messageId,
            data: {
              arrayName: arrayText,
              mapper: nodeInfo.mapper ?? '',
            },
            fix: (fixer) => {
              const replacement =
                nodeInfo.messageId === 'useArrSum'
                  ? `Arr.sum(${arrayText})`
                  : `Arr.sumBy(${arrayText}, ${nodeInfo.mapper})`;

              const importFixes =
                index === 0 && !hasArrImport
                  ? buildImportFixes(fixer, program, tsDataForgeImport, ['Arr'])
                  : [];

              return [
                ...importFixes,
                fixer.replaceText(nodeInfo.node, replacement),
              ];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;
