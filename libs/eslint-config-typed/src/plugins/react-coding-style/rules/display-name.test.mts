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

describe('display-name through type wrappers', () => {
  tester.run('display-name', displayNameRule, {
    valid: [
      {
        name: 'a wrapped memo call with displayName',
        code: dedent`
          const C = React.memo(() => <div />) satisfies React.FC;
          C.displayName = 'C';
        `,
      },
      {
        name: 'displayName wrapped in `as const` or `satisfies`',
        code: dedent`
          const C = React.memo(() => <div />);
          C.displayName = 'C' as const;
          const D = React.memo(() => <div />);
          D.displayName = 'D' satisfies string;
          const E = React.memo(() => <div />);
          E.displayName = \`E\`!;
        `,
      },
      {
        name: 'the component wrapped on the left of the assignment',
        code: dedent`
          const C = React.memo(() => <div />);
          (C as React.NamedExoticComponent).displayName = 'C';
          const D = React.memo(() => <div />);
          D!.displayName = 'D';
          const E = React.memo(() => <div />);
          (E.displayName satisfies string | undefined) = 'E';
        `,
      },
    ],
    invalid: [
      {
        name: 'memo call wrapped in `satisfies`, without displayName',
        code: dedent`
          const C = React.memo(() => <div />) satisfies React.FC;
        `,
        errors: [{ messageId: 'missingDisplayName' }],
      },
      {
        name: 'memo callee wrapped in `as`, without displayName',
        code: dedent`
          const C = (React.memo as typeof React.memo)(() => <div />);
        `,
        errors: [{ messageId: 'missingDisplayName' }],
      },
      {
        name: 'a wrapped displayName that does not match',
        code: dedent`
          const C = React.memo(() => <div />);
          C.displayName = 'Other' as const;
        `,
        errors: [
          {
            messageId: 'mismatchedDisplayName',
            data: { componentName: 'C' },
          },
        ],
      },
      {
        name: 'the wrong component wrapped on the left of the assignment',
        code: dedent`
          const C = React.memo(() => <div />);
          (Other as React.NamedExoticComponent).displayName = 'C';
        `,
        errors: [{ messageId: 'missingDisplayName' }],
      },
    ],
  });
});
