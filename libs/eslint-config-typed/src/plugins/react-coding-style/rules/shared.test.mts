import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { type TSESLint } from '@typescript-eslint/utils';
import { getReactMemoArrowFunction, isReactApiCall } from './shared.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

const reactApiRule: TSESLint.RuleModule<'reactApiDetected', readonly []> = {
  meta: {
    type: 'problem',
    docs: { description: 'test helper isReactApiCall' },
    schema: [],
    messages: {
      reactApiDetected: 'React API call detected',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression: (node) => {
      if (isReactApiCall(context, node, 'memo')) {
        context.report({ node, messageId: 'reactApiDetected' });
      }
    },
  }),
} as const;

const reactMemoArrowRule: TSESLint.RuleModule<'arrowDetected', readonly []> = {
  meta: {
    type: 'problem',
    docs: { description: 'test helper getReactMemoArrowFunction' },
    schema: [],
    messages: {
      arrowDetected: 'React.memo received arrow function',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression: (node) => {
      if (!isReactApiCall(context, node, 'memo')) {
        return;
      }

      const arrow = getReactMemoArrowFunction(node);

      if (arrow !== undefined) {
        assert.strictEqual(arrow.type, 'ArrowFunctionExpression');

        context.report({ node, messageId: 'arrowDetected' });
      }
    },
  }),
} as const;

describe('shared helpers', () => {
  tester.run('isReactApiCall', reactApiRule, {
    valid: [
      {
        name: 'non React call',
        code: 'const x = fn();',
      },
      {
        name: 'memo imported from non-react',
        code: `
          import { memo } from 'not-react';
          const Component = memo(() => null);
        `,
      },
      {
        name: 'React member but different method',
        code: `
          import * as React from 'react';
          const Component = React.useMemo(() => null, []);
        `,
      },
    ],
    invalid: [
      {
        name: 'named memo import from react',
        code: `
          import { memo } from 'react';
          const Component = memo(() => null);
        `,
        errors: [{ messageId: 'reactApiDetected' }],
      },
      {
        name: 'namespace React memo call',
        code: `
          import * as React from 'react';
          const Component = React.memo(() => null);
        `,
        errors: [{ messageId: 'reactApiDetected' }],
      },
      {
        name: 'global React memo call without import',
        code: `
          const Component = React.memo(() => null);
        `,
        errors: [{ messageId: 'reactApiDetected' }],
      },
    ],
  });

  tester.run('getReactMemoArrowFunction', reactMemoArrowRule, {
    valid: [
      {
        name: 'memo with non-arrow first argument',
        code: `
          import { memo } from 'react';
          function Component() { return null; }
          const Wrapped = memo(Component);
        `,
      },
      {
        name: 'non React call with arrow argument',
        code: `
          const Wrapped = wrap(() => null);
        `,
      },
    ],
    invalid: [
      {
        name: 'memo with arrow function argument',
        code: `
          import { memo } from 'react';
          const Wrapped = memo(() => null);
        `,
        errors: [{ messageId: 'arrowDetected' }],
      },
      {
        name: 'React namespace memo with arrow function argument',
        code: `
          import * as React from 'react';
          const Wrapped = React.memo(() => null);
        `,
        errors: [{ messageId: 'arrowDetected' }],
      },
    ],
  });
});
