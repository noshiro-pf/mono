import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { isReactApiCall } from './shared.mjs';

type ComponentNameOption = Readonly<{
  maxLength?: number;
  pattern?: RegExp;
}>;

type Options = readonly [ComponentNameOption] | readonly [];

type MessageIds = 'componentNameTooLong' | 'componentNameDoesNotMatch';

// NOTE:
// `const Name = React.memo<Props>((props) => {`
// が1行に収まるようにするためのルール。1行に収まらないとインデントが増えてコンポーネント実装の可読性が下がりやすくなるため。
// component props の型名や引数名の制約と併せて、 prettier のデフォルト print-width = 80 で export を省いた場合の最大長としてデフォルト値 42 を設定している。
// 抵触する場合、以下のように書き換える。
//
// const Component = React.memo<Props>((props) => {
//   ...
// });
//
// export { Component as SomeComponent };

export const componentNameRule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces naming conventions for variables assigned to React.memo(...) components.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxLength: {
            type: 'integer',
            minimum: 1,
          },
          pattern: {
            type: 'object',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      componentNameTooLong:
        'The component name length should be less than {{ maxLength }}. Consider rewrite as `const Component = React.memo<Props>((props) => { }); export { Component as SomeComponent };`.',
      componentNameDoesNotMatch:
        'The component name should match {{ pattern }}.',
    },
  },
  create: (context) => {
    const option = context.options[0];

    const maxLength = option?.maxLength ?? 42;

    const pattern = option?.pattern;

    return {
      VariableDeclarator: (node) => {
        if (
          node.id.type !== AST_NODE_TYPES.Identifier ||
          node.init?.type !== AST_NODE_TYPES.CallExpression
        ) {
          return;
        }

        if (!isReactApiCall(context, node.init, 'memo')) {
          return;
        }

        if (node.id.name.length >= maxLength) {
          context.report({
            node: node.id,
            messageId: 'componentNameTooLong',
            data: {
              maxLength: maxLength.toString(),
            },
          });

          return;
        }

        if (pattern !== undefined && !pattern.test(node.id.name)) {
          context.report({
            node: node.id,
            messageId: 'componentNameDoesNotMatch',
            data: {
              pattern: String(pattern),
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
};
