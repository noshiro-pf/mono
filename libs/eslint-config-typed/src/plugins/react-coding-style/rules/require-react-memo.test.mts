import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { requireReactMemoRule } from './require-react-memo.mjs';

const ruleName = 'require-react-memo';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

describe(ruleName, () => {
  describe('default behavior', () => {
    tester.run(ruleName, requireReactMemoRule, {
      valid: [
        {
          name: 'Memoized component',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => <div>{props.value}</div>);
          `,
        },
        {
          name: 'Memoized component with a block body',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              return <div>{props.value}</div>;
            });
          `,
        },
        {
          name: 'Memoized component with a named import',
          code: dedent`
            import { memo } from 'react';

            const MyComponent = memo(() => <div>Hello</div>);
          `,
        },
        {
          name: 'Memoized component built with React.createElement',
          code: dedent`
            const MyComponent = React.memo(() => React.createElement('div'));
          `,
        },
        {
          name: 'Memoized forwardRef component',
          code: dedent`
            const MyComponent = React.memo(
              React.forwardRef((props, ref) => <div ref={ref} />),
            );
          `,
        },
        {
          name: 'Component passed to an unknown higher order component',
          code: dedent`
            const MyComponent = memoNamed('MyComponent', () => <div>Hello</div>);
          `,
        },
        {
          name: 'Element returned from a callback inside a memoized component',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => (
              <ul>{props.items.map((item) => <li key={item}>{item}</li>)}</ul>
            ));
          `,
        },
        {
          name: 'Element built by a hook inside a memoized component',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const Content = React.useMemo(() => <div>{props.value}</div>, [props.value]);

              return Content;
            });
          `,
        },
        {
          name: 'Element rendered at the top level of a module',
          code: dedent`
            ReactDOM.createRoot(element).render(<App />);
          `,
        },
        {
          name: 'Function whose name is not a component name',
          code: dedent`
            const renderRow = (item) => <li>{item}</li>;
          `,
        },
        {
          name: 'Anonymous component definition',
          code: dedent`
            export default () => <div>Hello</div>;
          `,
        },
        {
          name: 'Function returning no element',
          code: dedent`
            const UseValue = () => 1;
          `,
        },
      ],
      invalid: [
        {
          name: 'Arrow function component',
          code: dedent`
            const MyComponent = () => <div>Hello</div>;
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Exported arrow function component with a block body',
          code: dedent`
            export const MyComponent = (props) => {
              return <div>{props.value}</div>;
            };
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Function declaration component',
          code: dedent`
            function MyComponent(props) {
              return <div>{props.value}</div>;
            }
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Default exported function declaration component',
          code: dedent`
            export default function MyComponent() {
              return <div>Hello</div>;
            }
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Component returning a fragment',
          code: dedent`
            const MyComponent = () => (
              <>
                <div>Hello</div>
              </>
            );
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Component built with React.createElement',
          code: dedent`
            const MyComponent = () => React.createElement('div');
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'forwardRef component without memo',
          code: dedent`
            const MyComponent = React.forwardRef((props, ref) => <div ref={ref} />);
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
        {
          name: 'Component defined inside a memoized component',
          code: dedent`
            const Outer = React.memo(() => {
              const Inner = () => <div>Hello</div>;

              return <Inner />;
            });
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'Inner' },
            },
          ],
        },
        {
          name: 'Component containing several elements is reported once',
          code: dedent`
            const MyComponent = () => (
              <div>
                <span>Hello</span>
              </div>
            );
          `,
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'MyComponent' },
            },
          ],
        },
      ],
    });
  });

  describe('ignoreName option', () => {
    tester.run(ruleName, requireReactMemoRule, {
      valid: [
        {
          name: 'Ignored component name (string)',
          code: dedent`
            const App = () => <div>Hello</div>;
          `,
          options: [{ ignoreName: 'App' }],
        },
        {
          name: 'Ignored component name (array)',
          code: dedent`
            const App = () => <div>Hello</div>;
          `,
          options: [{ ignoreName: ['Root', 'App'] }],
        },
      ],
      invalid: [
        {
          name: 'Component name not listed in ignoreName',
          code: dedent`
            const Root = () => <div>Hello</div>;
          `,
          options: [{ ignoreName: ['App'] }],
          errors: [
            {
              messageId: 'requireReactMemo',
              data: { componentName: 'Root' },
            },
          ],
        },
      ],
    });
  });
});
