import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { componentVarTypeAnnotationRule } from './component-var-type-annotation.mjs';

const ruleName = 'component-var-type-annotation';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

tester.run(ruleName, componentVarTypeAnnotationRule, {
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
  ],
  invalid: [
    {
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        type Component = React.FC<Props>;
      `,
      errors: [
        {
          messageId: 'disallowReactFunctionalComponentTypes',
        },
      ],
    },
    {
      code: dedent`
        type Props = Readonly<{
          readonly value: number;
        }>;

        type Component = React.FunctionComponent<Props>;
      `,
      errors: [
        {
          messageId: 'disallowReactFunctionalComponentTypes',
        },
      ],
    },
  ],
});
