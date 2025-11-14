import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'namespaceImportRequired' | 'namespaceNameMustBeReact';

// NOTE: React の import 方法を `import * as React from 'react'` と namespace import のみに限定するルール。
// import を1回で済ませられて便利なのと、 React.* に対する以降のルールを書きやすくするため。
// tree-shaking に悪影響は無い。

export const importStyleRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Enforces importing React with a single namespace import named 'React'.",
    },
    schema: [],
    messages: {
      namespaceImportRequired:
        "React should be imported as `import * as React from 'react'`.",
      namespaceNameMustBeReact:
        "The namespace name imported from 'react' must be 'React'.",
    },
  },
  create: (context) => ({
    ImportDeclaration: (node) => {
      if (node.source.value !== 'react') {
        return;
      }

      const [firstSpecifier] = node.specifiers;

      if (
        firstSpecifier === undefined ||
        firstSpecifier.type !== AST_NODE_TYPES.ImportNamespaceSpecifier ||
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
    },
  }),
  defaultOptions: [],
};
