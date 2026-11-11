import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { propsTypeAnnotationStyleRule } from './props-type-annotation-style.mjs';

const ruleName = 'props-type-annotation-style';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, propsTypeAnnotationStyleRule, {
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
      code: dedent`
        const NonComponent = someFunction((props: Props) => props.value);
      `,
    },
  ],
  invalid: [
    {
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        const Component = React.memo((props: Props) => {
          return React.createElement('div', props);
        });
      `,
      errors: [
        {
          messageId: 'disallowPropsTypeAnnotation',
        },
      ],
    },
    {
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        const Component = React.memo<Props>((props: Props) => {
          return React.createElement('div', props);
        });
      `,
      errors: [
        {
          messageId: 'disallowPropsTypeAnnotation',
        },
      ],
    },
  ],
});

describe('props-type-annotation-style through type wrappers', () => {
  tester.run(ruleName, propsTypeAnnotationStyleRule, {
    valid: [
      {
        name: 'a wrapped arrow function without annotation',
        code: dedent`
          const Component = React.memo<Props>(((props) => {
            return React.createElement('div', props);
          }) satisfies React.FC<Props>);
        `,
      },
    ],
    invalid: [
      {
        name: 'arrow function wrapped in `satisfies`',
        code: dedent`
          const Component = React.memo(((props: Props) => {
            return React.createElement('div', props);
          }) satisfies React.FC<Props>);
        `,
        errors: [{ messageId: 'disallowPropsTypeAnnotation' }],
      },
      {
        name: 'memo callee wrapped in `as`',
        code: dedent`
          const Component = (React.memo as typeof React.memo)((props: Props) => {
            return React.createElement('div', props);
          });
        `,
        errors: [{ messageId: 'disallowPropsTypeAnnotation' }],
      },
    ],
  });
});
