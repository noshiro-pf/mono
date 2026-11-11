import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { singleJsxReturnRule } from './single-jsx-return.mjs';

const ruleName = 'single-jsx-return';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

describe(ruleName, () => {
  tester.run(ruleName, singleJsxReturnRule, {
    valid: [
      {
        name: 'one return statement',
        code: dedent`
          const ProductPage = React.memo<Props>((props) => {
            const product = products[props.index];

            return product === undefined ? (
              <p>{'No product'}</p>
            ) : (
              <section>{product.name}</section>
            );
          });
        `,
      },
      {
        name: 'an expression body',
        code: dedent`
          const A = React.memo<Props>((props) => (props.ok ? <div /> : <span />));
        `,
      },
      {
        name: 'returns of nested functions belong to them',
        code: dedent`
          const A = React.memo<Props>((props) => {
            const onClick = React.useCallback(() => {
              if (props.disabled) return;
              props.onClick();
            }, [props]);

            return (
              <ul onClick={onClick}>
                {props.items.map((item) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            );
          });
        `,
      },
      {
        name: 'the cases of a final switch are one exit',
        code: dedent`
          function Legacy(props) {
            const kind = props.kind;

            switch (kind) {
              case 'a':
                return <A />;
              case 'b': {
                const label = props.label;
                return <B label={label} />;
              }
              default:
                return <C />;
            }
          }

          const icon = React.useMemo(() => {
            switch (iconName) {
              case 'good':
                return <CircleIcon />;
              case 'none':
                return <div />;
            }
          }, [iconName]);
        `,
      },
      {
        name: 'a function returning no JSX may return more than once',
        code: dedent`
          const toLabel = (n) => {
            if (n === 0) return 'none';
            return String(n);
          };

          function find(xs, id) {
            for (const x of xs) {
              if (x.id === id) return x;
            }
            return undefined;
          }
        `,
      },
    ],
    invalid: [
      {
        name: 'the product page of the synstate-router sample app',
        code: dedent`
          export const ProductPage = React.memo<Props>((props) => {
            const product = products[props.index];

            if (product === undefined) {
              return (
                <section>
                  <h1>{'No product'}</h1>
                </section>
              );
            }

            return (
              <section>
                <h1>{product.name}</h1>
              </section>
            );
          });
        `,
        errors: [{ messageId: 'singleJsxReturn', line: 5 }],
      },
      {
        name: 'an early return of null or undefined',
        code: dedent`
          const A = React.memo<Props>((props) => {
            if (!props.visible) return null;

            return <div />;
          });

          const B = React.memo<Props>((props) => {
            if (!props.visible) {
              return undefined;
            }

            return <div />;
          });

          const C = React.memo<Props>((props) => {
            if (!props.visible) {
              return;
            }

            return <div />;
          });
        `,
        errors: [
          { messageId: 'singleJsxReturn', line: 2 },
          { messageId: 'singleJsxReturn', line: 9 },
          { messageId: 'singleJsxReturn', line: 17 },
        ],
      },
      {
        name: 'JSX in a conditional or logical expression',
        code: dedent`
          const A = React.memo<Props>((props) => {
            if (props.loading) return 'Loading';

            return props.ok ? <div /> : undefined;
          });

          const B = React.memo<Props>((props) => {
            if (props.loading) return 'Loading';

            return props.ok && <div />;
          });
        `,
        errors: [
          { messageId: 'singleJsxReturn', line: 2 },
          { messageId: 'singleJsxReturn', line: 8 },
        ],
      },
      {
        name: 'any function that returns JSX, not only a component',
        code: dedent`
          const renderItem = (item) => {
            if (item.hidden) return undefined;
            return <li>{item.name}</li>;
          };

          const List = React.memo<Props>((props) => (
            <ul>
              {props.items.map((item) => {
                if (item.hidden) return undefined;
                return <li key={item.id}>{item.name}</li>;
              })}
            </ul>
          ));
        `,
        errors: [
          { messageId: 'singleJsxReturn', line: 2 },
          { messageId: 'singleJsxReturn', line: 9 },
        ],
      },
      {
        name: 'a return before the final switch, or a switch that is not last',
        code: dedent`
          const A = React.memo<Props>((props) => {
            if (props.loading) return null;

            switch (props.kind) {
              case 'a':
                return <A />;
              default:
                return <B />;
            }
          });

          const B = React.memo<Props>((props) => {
            switch (props.kind) {
              case 'a':
                return <A />;
              default:
                break;
            }

            return <B />;
          });

          const C = React.memo<Props>((props) => {
            switch (props.kind) {
              case 'a':
                if (props.loading) return null;
                return <A />;
              default:
                return <B />;
            }
          });
        `,
        errors: [
          { messageId: 'singleJsxReturn', line: 2 },
          { messageId: 'singleJsxReturn', line: 15 },
          { messageId: 'singleJsxReturn', line: 26 },
        ],
      },
      {
        name: 'a component returning JSX through a variable, a map or an array',
        code: dedent`
          const A = React.memo<Props>((props) => {
            const content = <B />;

            if (!props.visible) return null;

            return content;
          });

          const List = React.memo<Props>((props) => {
            if (props.items === undefined) return null;

            return props.items.map((item) => <li key={item.id}>{item.name}</li>);
          });

          const renderPair = (props) => {
            if (props.empty) return [];

            return [<A key={'a'} />, <B key={'b'} />];
          };

          function Legacy(props) {
            const content = <B />;

            if (!props.visible) return undefined;

            return content;
          }

          function Created(props) {
            const content = React.createElement('div');

            if (!props.visible) return undefined;

            return content;
          }
        `,
        errors: [
          { messageId: 'singleJsxReturn', line: 4 },
          { messageId: 'singleJsxReturn', line: 10 },
          { messageId: 'singleJsxReturn', line: 16 },
          { messageId: 'singleJsxReturn', line: 24 },
          { messageId: 'singleJsxReturn', line: 32 },
        ],
      },
      {
        name: 'an async component is checked too',
        code: dedent`
          async function Page(props) {
            const content = <div />;

            if (!props.visible) return null;

            return content;
          }
        `,
        errors: [{ messageId: 'singleJsxReturn', line: 4 }],
      },
      {
        name: 'componentWrappers makes the function given to it a component',
        code: dedent`
          const A = memoNamed<Props>('A', (props) => {
            const content = <B />;

            if (!props.visible) return null;

            return content;
          });
        `,
        options: [{ componentWrappers: ['memoNamed'] }],
        errors: [{ messageId: 'singleJsxReturn', line: 4 }],
      },
      {
        name: 'React.createElement counts as JSX',
        code: dedent`
          const A = React.memo<Props>((props) => {
            if (props.loading) return null;

            return React.createElement('div');
          });
        `,
        errors: [{ messageId: 'singleJsxReturn', line: 2 }],
      },
    ],
  });
});

describe(`${ruleName} through type wrappers`, () => {
  tester.run(ruleName, singleJsxReturnRule, {
    valid: [
      {
        name: 'one wrapped return',
        code: dedent`
          const A = React.memo<Props>((props) => {
            return (props.ok ? <div /> : <span />) as React.ReactNode;
          });
        `,
      },
    ],
    invalid: [
      {
        name: 'wrapped JSX',
        code: dedent`
          const A = React.memo<Props>((props) => {
            if (props.loading) return null;

            return (<div />) satisfies React.ReactNode;
          });

          const B = React.memo<Props>((props) => {
            if (props.loading) return null;

            return (props.ok ? (<div /> as React.ReactNode) : undefined)!;
          });

          const C = React.memo<Props>((props) => {
            if (props.loading) return null;

            return (React.createElement as typeof React.createElement)('div');
          });
        `,
        errors: [
          { messageId: 'singleJsxReturn', line: 2 },
          { messageId: 'singleJsxReturn', line: 8 },
          { messageId: 'singleJsxReturn', line: 14 },
        ],
      },
    ],
  });
});
