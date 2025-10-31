import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { useMemoHooksStyleRule } from './use-memo-hooks-style.mjs';

const ruleName = 'use-memo-hook-style';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, useMemoHooksStyleRule, {
  valid: [
    {
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        const Component = React.memo<Props>((props) => {
          const memoized = React.useMemo<number>(() => props.value, [props.value]);
          const typed: number = React.useMemo(() => props.value, [props.value]);
          return React.createElement('div', { memoized, typed });
        });
      `,
    },
  ],
  invalid: [
    {
      name: 'Disallow type assertion',
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        const Component = React.memo<Props>((props) => {
          const value = React.useMemo(() => props.value, [props.value]) as number;
          return value;
        });
      `,
      errors: [
        {
          messageId: 'disallowUseMemoTypeAnnotation',
        },
      ],
    },
    {
      name: 'Disallow satisfies expression',
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        const Component = React.memo<Props>((props) => {
          const value = React.useMemo(() => props.value, [props.value]) satisfies number;
          return value;
        });
      `,
      errors: [
        {
          messageId: 'disallowUseMemoTypeAnnotation',
        },
      ],
    },
  ],
});
