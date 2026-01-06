import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

type ImportStyle = 'namespace' | 'named';

type Options = readonly [
  Readonly<{
    importStyle?: ImportStyle;
  }>?,
];

type MessageIds =
  | 'namespaceImportRequired'
  | 'namespaceNameMustBeReact'
  | 'namedImportRequired';

// NOTE: React の import 方法を指定するルール。
// デフォルトは `import * as React from 'react'` と namespace import のみに限定。
// import を1回で済ませられて便利なのと、 React.* に対する以降のルールを書きやすくするため。
// tree-shaking に悪影響は無い。
// オプションで named imports `import { useState, useEffect } from 'react'` も許可可能。

export const importStyleRule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces importing React with a specific style (namespace or named imports).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          importStyle: {
            type: 'string',
            enum: ['namespace', 'named'],
            description:
              'Import style to enforce: "namespace" for `import * as React` or "named" for `import { ... }`',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      namespaceImportRequired:
        "React should be imported as `import * as React from 'react'`.",
      namespaceNameMustBeReact:
        "The namespace name imported from 'react' must be 'React'.",
      namedImportRequired:
        "React should be imported as named imports like `import { useState } from 'react'`.",
    },
  },
  create: (context) => {
    const options = context.options[0] ?? {};

    const importStyle = options.importStyle ?? 'namespace';

    return {
      ImportDeclaration: (node) => {
        if (node.source.value !== 'react') {
          return;
        }

        switch (importStyle) {
          case 'named': {
            // Check that all specifiers are named imports
            const hasInvalidSpecifier = node.specifiers.some(
              (spec) =>
                spec.type === AST_NODE_TYPES.ImportNamespaceSpecifier ||
                spec.type === AST_NODE_TYPES.ImportDefaultSpecifier,
            );

            if (hasInvalidSpecifier) {
              context.report({
                node,
                messageId: 'namedImportRequired',
              });
            }

            break;
          }

          case 'namespace': {
            // namespace import mode (default)
            const [firstSpecifier] = node.specifiers;

            if (
              firstSpecifier?.type !==
                AST_NODE_TYPES.ImportNamespaceSpecifier ||
              node.specifiers.length !== 1
            ) {
              context.report({
                node,
                messageId: 'namespaceImportRequired',
              });

              return;
            }

            if (firstSpecifier.local.name !== 'React') {
              context.report({
                node: firstSpecifier.local,
                messageId: 'namespaceNameMustBeReact',
              });
            }

            break;
          }
        }
      },
    };
  },
  defaultOptions: [],
};
