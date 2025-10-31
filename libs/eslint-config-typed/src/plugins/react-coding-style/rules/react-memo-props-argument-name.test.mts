import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { reactMemoPropsArgumentNameRule } from './react-memo-props-argument-name.mjs';

const ruleName = 'react-memo-props-argument-name';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, reactMemoPropsArgumentNameRule, {
  valid: [
    {
      code: dedent`
        const Component = React.memo<Props>((props) => {
          return React.createElement('div', props);
        });
      `,
    },
  ],
  invalid: [
    {
      name: 'Require identifier named props',
      code: dedent`
        const Component = React.memo<Props>((properties) => {
          return React.createElement('div', properties);
        });
      `,
      errors: [
        {
          messageId: 'propsParamMustBeNamedProps',
        },
      ],
    },
    {
      name: 'Disallow destructuring',
      code: dedent`
        const Component = React.memo<Props>(({ value }) => {
          return React.createElement('div', { value });
        });
      `,
      errors: [
        {
          messageId: 'propsParamMustBeIdentifier',
        },
      ],
    },
  ],
});
