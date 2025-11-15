import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { displayNameRule } from './display-name.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

describe('display-name', () => {
  describe('default behavior', () => {
    tester.run('display-name', displayNameRule, {
      valid: [
        {
          name: 'Component with displayName',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
            MyComponent.displayName = 'MyComponent';
          `,
        },
        {
          name: 'Named import with displayName',
          code: dedent`
            import { memo } from 'react';
            const MyComponent = memo(() => <div>Hello</div>);
            MyComponent.displayName = 'MyComponent';
          `,
        },
        {
          name: 'Non-component variable',
          code: dedent`
            const notAComponent = someFunction();
          `,
        },
      ],
      invalid: [
        {
          name: 'Component without displayName',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
          `,
          errors: [{ messageId: 'missingDisplayName' }],
        },
        {
          name: 'Named import without displayName',
          code: dedent`
            import { memo } from 'react';
            const MyComponent = memo(() => <div>Hello</div>);
          `,
          errors: [{ messageId: 'missingDisplayName' }],
        },
      ],
    });
  });

  describe('ignoreTranspilerName option', () => {
    tester.run('display-name with ignoreTranspilerName', displayNameRule, {
      valid: [
        {
          name: 'Component without displayName (ignored)',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
          `,
          options: [{ ignoreTranspilerName: true }],
        },
        {
          name: 'Component with displayName',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
            MyComponent.displayName = 'MyComponent';
          `,
          options: [{ ignoreTranspilerName: true }],
        },
      ],
      invalid: [],
    });
  });
});
