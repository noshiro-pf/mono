import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { banUseImperativeHandleHook } from './ban-use-imperative-handle-hook.mjs';

const ruleName = 'ban-use-imperative-handle-hook';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, banUseImperativeHandleHook, {
  valid: [],
  invalid: [
    {
      name: 'Disallow React.useImperativeHandle',
      code: dedent`
        type Props = Readonly<{
          readonly ref: unknown;
        }>;

        const Component = React.memo<Props>((props) => {
          React.useImperativeHandle(props.ref, () => ({}));
          return null;
        });
      `,
      errors: [
        {
          messageId: 'disallowUseImperativeHandle',
        },
      ],
    },
  ],
});
