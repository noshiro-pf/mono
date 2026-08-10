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
        {
          name: 'Exported component with displayName',
          code: dedent`
            export const MyComponent = React.memo(() => <div>Hello</div>);
            MyComponent.displayName = 'MyComponent';
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
          name: 'Exported component without displayName',
          code: dedent`
            export const MyComponent = React.memo(() => <div>Hello</div>);
          `,
          errors: [{ messageId: 'missingDisplayName' }],
        },
        {
          name: 'Component with mismatched displayName',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
            MyComponent.displayName = 'Other';
          `,
          errors: [
            {
              messageId: 'mismatchedDisplayName',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Named import without displayName',
          code: dedent`
            import { memo } from 'react';
            const MyComponent = memo(() => <div>Hello</div>);
          `,
          errors: [{ messageId: 'missingDisplayName' }],
        },
        {
          name: 'Named import with mismatched displayName',
          code: dedent`
            import { memo } from 'react';
            const MyComponent = memo(() => <div>Hello</div>);
            MyComponent.displayName = 'Component';
          `,
          errors: [
            {
              messageId: 'mismatchedDisplayName',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Exported component with mismatched displayName',
          code: dedent`
            export const MyComponent = React.memo(() => <div>Hello</div>);
            MyComponent.displayName = 'Component';
          `,
          errors: [
            {
              messageId: 'mismatchedDisplayName',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
      ],
    });
  });

  describe('ignoreName option', () => {
    tester.run('display-name with ignoreName', displayNameRule, {
      valid: [
        {
          name: 'Component with mismatched displayName (ignored)',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
            MyComponent.displayName = 'Other';
          `,
          options: [{ ignoreName: 'MyComponent' }],
        },
        {
          name: 'Component with displayName',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
            MyComponent.displayName = 'MyComponent';
          `,
          options: [{ ignoreName: ['MyComponent'] }],
        },
      ],
      invalid: [
        {
          name: 'Component without displayName is still reported',
          code: dedent`
            const MyComponent = React.memo(() => <div>Hello</div>);
          `,
          options: [{ ignoreName: ['MyComponent'] }],
          errors: [{ messageId: 'missingDisplayName' }],
        },
      ],
    });
  });
});
