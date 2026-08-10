import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { reactMemoTypeParameterRule } from './react-memo-type-parameter.mjs';

const ruleName = 'react-memo-type-parameter';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, reactMemoTypeParameterRule, {
  valid: [
    {
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        const Component = React.memo<Props>((props) => {
          return React.createElement('div', props);
        });
      `,
    },
    {
      name: 'Allows memo without props argument',
      code: dedent`
        const Component = React.memo(() => {
          return React.createElement('div');
        });
      `,
    },
  ],
  invalid: [
    {
      name: 'Unnecessary type parameter without props',
      code: dedent`
        const Component = React.memo<Props>(() => {
          return React.createElement('div');
        });
      `,
      errors: [
        {
          messageId: 'omitTypeParameterWhenPropsEmpty',
        },
      ],
    },
    {
      name: 'Missing type parameter',
      code: dedent`
        const Component = React.memo((props) => {
          return React.createElement('div', props);
        });
      `,
      errors: [
        {
          messageId: 'requirePropsTypeParameter',
        },
      ],
    },
    {
      name: 'Wrong type reference',
      code: dedent`
        const Component = React.memo<Readonly<{ readonly value: number }>>((props) => {
          return React.createElement('div', props);
        });
      `,
      errors: [
        {
          messageId: 'requirePropsTypeParameter',
        },
      ],
    },
    {
      name: 'Multiple type parameters',
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        const Component = React.memo<Props, unknown>((props) => {
          return React.createElement('div', props);
        });
      `,
      errors: [
        {
          messageId: 'requirePropsTypeParameter',
        },
      ],
    },
  ],
});
