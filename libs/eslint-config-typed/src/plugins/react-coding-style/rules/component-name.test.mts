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
