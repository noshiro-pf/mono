import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { hasKey, isRecord } from 'ts-data-forge';

type MessageIds = 'useAssert';

type CallExpressionWithLegacyTypeParameters = TSESTree.CallExpression &
  Readonly<{
    typeParameters?: TSESTree.TSTypeParameterInstantiation;
  }>;

export const noExpectToStrictEqualRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `expect().toStrictEqual()` in favor of `assert.deepStrictEqual()`.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useAssert:
        'Use `assert.deepStrictEqual()` instead of `expect().toStrictEqual()`.',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const sourceCode = context.sourceCode;

    return {
      CallExpression: (node) => {
        if (!isToStrictEqualInvocation(node)) {
          return;
        }

        const expectCall = node.callee.object;

        if (!isExpectCall(expectCall)) {
          return;
        }

        if (
          expectCall.arguments.length !== 1 ||
          node.arguments.length !== 1 ||
          expectCall.arguments[0]?.type === AST_NODE_TYPES.SpreadElement ||
          node.arguments[0]?.type === AST_NODE_TYPES.SpreadElement
        ) {
          return;
        }

        const actualArgument = expectCall.arguments[0];

        const expectedArgument = node.arguments[0];

        if (actualArgument === undefined || expectedArgument === undefined) {
          return;
        }

        const actualText = sourceCode.getText(actualArgument);

        const expectedText = sourceCode.getText(expectedArgument);

        const typeArgumentText = getTypeArgumentText(node, sourceCode);

        const expectedWithCast =
          typeArgumentText === undefined
            ? expectedText
            : `(${expectedText}) as ${typeArgumentText}`;

        context.report({
          node,
          messageId: 'useAssert',
          fix: (fixer) =>
            fixer.replaceText(
              node,
              `assert.deepStrictEqual(${actualText}, ${expectedWithCast})`,
            ),
        });
      },
    };
  },
};

const isToStrictEqualInvocation = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): node is TSESTree.CallExpression & {
  callee: TSESTree.MemberExpression & {
    object: TSESTree.CallExpression;
    property: TSESTree.Identifier;
  };
} => {
  if (
    node.callee.type !== AST_NODE_TYPES.MemberExpression ||
    node.optional ||
    node.callee.optional ||
    node.callee.computed
  ) {
    return false;
  }

  return (
    node.callee.property.type === AST_NODE_TYPES.Identifier &&
    node.callee.property.name === 'toStrictEqual' &&
    node.callee.object.type === AST_NODE_TYPES.CallExpression
  );
};

const isExpectCall = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): node is TSESTree.CallExpression & {
  callee: TSESTree.Identifier;
} =>
  node.callee.type === AST_NODE_TYPES.Identifier &&
  node.callee.name === 'expect';

const getTypeArgumentText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): string | undefined => {
  const typeArguments =
    getModernTypeArguments(node) ?? getLegacyTypeParameters(node);

  if (typeArguments === undefined) {
    return undefined;
  }

  const rawText = sourceCode.getText(typeArguments).trim();

  if (rawText.length < 2) {
    return undefined;
  }

  const withoutAngles = rawText
    .replace(/^\s*</u, '')
    .replace(/>\s*$/u, '')
    .trim();

  return withoutAngles.length === 0 ? undefined : withoutAngles;
};

const getModernTypeArguments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): TSESTree.TSTypeParameterInstantiation | undefined =>
  isRecord(node) && hasKey(node, 'typeArguments')
    ? node.typeArguments
    : undefined;

const getLegacyTypeParameters = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): TSESTree.TSTypeParameterInstantiation | undefined =>
  isRecord(node) && hasKey(node, 'typeParameters')
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (node as CallExpressionWithLegacyTypeParameters).typeParameters
    : undefined;
