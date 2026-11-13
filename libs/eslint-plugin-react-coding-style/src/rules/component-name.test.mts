import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { componentNameRule } from './component-name.mjs';

const ruleName = 'component-name';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, componentNameRule, {
  valid: [
    {
      code: dedent`
        const Component = React.memo<Props>((props) => {
          return React.createElement('div', props);
        });
      `,
      options: [
        {
          maxLength: 20,
          pattern: /^Component$/u,
        },
      ],
    },
  ],
  invalid: [
    {
      name: 'Name too long',
      code: dedent`
        const VeryLongComponentName = React.memo<Props>((props) => {
          return React.createElement('div', props);
        });
      `,
      options: [
        {
          maxLength: 10,
        },
      ],
      errors: [
        {
          messageId: 'componentNameTooLong',
        },
      ],
    },
    {
      name: 'Name does not match pattern',
      code: dedent`
        const component = React.memo<Props>((props) => {
          return React.createElement('div', props);
        });
      `,
      options: [
        {
          pattern: /^Component$/u,
        },
      ],
      errors: [
        {
          messageId: 'componentNameDoesNotMatch',
        },
      ],
    },
  ],
});

describe('component-name through type wrappers', () => {
  tester.run(ruleName, componentNameRule, {
    valid: [
      {
        name: 'a wrapped memo call whose name matches',
        code: dedent`
          const Component = React.memo(() => null) satisfies unknown;
        `,
        options: [{ pattern: /^Component$/u }],
      },
    ],
    invalid: [
      {
        name: 'memo call wrapped in `satisfies`',
        code: dedent`
          const Cc = React.memo(() => null) satisfies unknown;
        `,
        options: [{ pattern: /^Component$/u }],
        errors: [{ messageId: 'componentNameDoesNotMatch' }],
      },
      {
        name: 'memo call wrapped in `as` or `!`',
        code: dedent`
          const Cc = React.memo(() => null) as unknown;
          const Dd = React.memo(() => null)!;
        `,
        options: [{ pattern: /^Component$/u }],
        errors: [
          { messageId: 'componentNameDoesNotMatch' },
          { messageId: 'componentNameDoesNotMatch' },
        ],
      },
      {
        name: 'memo callee wrapped in `as`',
        code: dedent`
          const VeryLongComponentName = (React.memo as typeof React.memo)(
            () => null,
          );
        `,
        options: [{ maxLength: 10 }],
        errors: [{ messageId: 'componentNameTooLong' }],
      },
    ],
  });
});
