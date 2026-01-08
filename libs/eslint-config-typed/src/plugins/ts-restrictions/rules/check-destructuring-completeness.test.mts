import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { checkDestructuringCompleteness } from './check-destructuring-completeness.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('check-destructuring-completeness', () => {
  tester.run(
    'check-destructuring-completeness',
    checkDestructuringCompleteness,
    {
      valid: [
        {
          name: 'ignore incomplete destructuring without directive comment',
          code: dedent`
            const obj = { a: 1, b: 2, c: 3 };
            const { a } = obj;
          `,
        },
        {
          name: 'validates destructuring with default directive - complete',
          code: dedent`
            const obj = { a: 1, b: 2, c: 3 };
            // @check-destructuring-completeness
            const { a, b, c } = obj;
          `,
        },
        {
          name: 'validates destructuring with unknown directive',
          code: dedent`
            const obj: { a: number; b: string; c: boolean } = { a: 1, b: 'hello', c: true };
            // @unknown-directive
            const { a, b } = obj;
          `,
        },
        {
          name: 'works with custom directive keyword - custom check',
          code: dedent`
            const obj: { a: number; b: string } = { a: 1, b: 'hello' };
            // @custom-check
            const { a, b } = obj;
          `,
          options: [{ directiveKeyword: '@custom-check' }],
        },
        {
          name: 'custom directive ignores default directive',
          code: dedent`
            const obj = { a: 1, b: 2, c: 3 };
            // @check-destructuring-completeness
            const { a, b } = obj;
          `,
          options: [{ directiveKeyword: '@custom-check' }],
        },
        {
          name: 'custom directive ignores unknown directive',
          code: dedent`
            const obj: { a: number; b: string; c: boolean } = { a: 1, b: 'hello', c: true };
            // @unknown-directive
            const { a, b } = obj;
          `,
          options: [{ directiveKeyword: '@custom-check' }],
        },
        {
          name: 'checks React component props - parameter destructuring',
          code: dedent`
            type Props = { a: number; b: string };
            const MyComponent = ({ a, b }: Props) => <div>{a}{b}</div>;
          `,
        },
        {
          name: 'checks React component props - internal destructuring',
          code: dedent`
            type Props = { a: number; b: string };
            const MyComponent = (props: Props) => {
              const { a, b } = props;
              return <div>{a}{b}</div>;
            };
          `,
        },
        {
          name: 'allows rest parameter without directive comment',
          code: dedent`
            const obj = { a: 1, b: 2, c: 3 };
            const { a, ...rest } = obj;
          `,
        },
        {
          name: 'allows rest parameter with directive comment',
          code: dedent`
            const obj = { a: 1, b: 2, c: 3 };
            // @check-destructuring-completeness
            const { a, ...rest } = obj;
          `,
        },
        {
          name: 'allows rest parameter in React component props',
          code: dedent`
            type Props = { a: number; b: string; c: boolean };
            const MyComponent = ({ a, ...rest }: Props) => <div>{a}</div>;
          `,
        },
        {
          name: 'allows rest parameter in internal destructuring',
          code: dedent`
            type Props = { a: number; b: string; c: boolean };
            const MyComponent = (props: Props) => {
              const { a, ...rest } = props;
              return <div>{a}</div>;
            };
          `,
        },
        {
          name: 'does not check React component props when disabled - parameter',
          code: dedent`
            type Props = { a: number; b: string; c: boolean };
            const MyComponent = ({ a, b }: Props) => <div>{a}{b}</div>;
          `,
          options: [{ alwaysCheckReactComponentProps: false }],
        },
        {
          name: 'does not check React component props when disabled - internal',
          code: dedent`
            type Props = { a: number; b: string; c: boolean };
            const MyComponent = (props: Props) => {
              const { a, b } = props;
              return <div>{a}{b}</div>;
            };
          `,
          options: [{ alwaysCheckReactComponentProps: false }],
        },
      ],
      invalid: [
        {
          name: 'validates destructuring with default directive - incomplete',
          code: dedent`
            const obj: { a: number; b: string; c: boolean } = { a: 1, b: 'hello', c: true };
            // @check-destructuring-completeness
            const { a, b } = obj;
          `,
          errors: [{ messageId: 'incompleteDestructuring' }],
        },
        {
          name: 'custom directive catches incomplete',
          code: dedent`
            const obj: { a: number; b: string } = { a: 1, b: 'hello' };
            // @custom-check
            const { a } = obj;
          `,
          options: [{ directiveKeyword: '@custom-check' }],
          errors: [{ messageId: 'incompleteDestructuring' }],
        },
        {
          name: 'checks React component props - parameter destructuring incomplete',
          code: dedent`
            type Props = { a: number; b: string; c: boolean };
            const MyComponent = ({ a, b }: Props) => <div>{a}{b}</div>;
          `,
          errors: [{ messageId: 'incompleteDestructuring' }],
        },
        {
          name: 'checks React component props - internal destructuring incomplete',
          code: dedent`
            type Props = { a: number; b: string; c: boolean };
            const MyComponent = (props: Props) => {
              const { a, b } = props;
              return <div>{a}{b}</div>;
            };
          `,
          errors: [{ messageId: 'incompleteDestructuring' }],
        },
      ],
    },
  );
}, 20000);
