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
