import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { requireUseMemoRule } from './require-use-memo.mjs';

const ruleName = 'require-use-memo';

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
  describe('default behavior', () => {
    tester.run(ruleName, requireUseMemoRule, {
      valid: [
        {
          name: 'primitive O(1) expressions',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const { q, sort, page } = props.list.search;
              const [first, second] = props.pair;
              const count = props.items.length;
              const label = \`\${props.name} (\${count})\`;
              const isEmpty = count === 0 || props.items[0] === undefined;
              const next = props.items[props.index + 1];
              const title = props.title ?? 'Untitled';
              const kind = typeof props.value;
              const negative = -props.value;
              const name = props.user?.profile.name;
              const big = 10n;

              return <div>{label}</div>;
            });
          `,
        },
        {
          name: 'hook calls, whatever their arguments',
          code: dedent`
            import { memo, useMemo } from 'react';

            const MyComponent = memo<Props>((props) => {
              const found = React.useMemo(
                () => props.items.filter((p) => p.visible),
                [props.items],
              );
              const onClick = React.useCallback(() => {
                props.onClick({ id: props.id });
              }, [props]);
              const sorted = useMemo(() => found.toSorted(), [found]);
              const active = useIsActive(props.node, { exact: true });
              const value = router.useValue();
              const data = React.use(props.promise);

              return <div onClick={onClick}>{sorted.length}{active}{value}{data}</div>;
            });
          `,
        },
        {
          name: 'calls of the default allowed functions with O(1) arguments',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const lastPage = Math.max(1, Math.ceil(props.total / perPage));
              const text = String(props.count);
              const n = Number(props.text);
              const isInt = Number.isSafeInteger(props.value);
              const flag = Boolean(props.value);
              const same = Object.is(props.a, props.b);
              const avg = (props.total / props.count).toFixed(1);
              const prefix = \`buckets.\${props.level.toString()}\`;

              return <div>{lastPage}{text}{n}{isInt}{flag}{same}{avg}{prefix}</div>;
            });
          `,
        },
        {
          name: 'computations outside of a component are not checked',
          code: dedent`
            const sorted = products.toSorted((a, b) => a.price - b.price);

            const toLabel = (p) => {
              const parts = [p.name, p.price];
              return parts.join(' ');
            };

            const helper = () => {
              const xs = items.filter((x) => x.visible);
              return xs;
            };
          `,
        },
        {
          name: 'declarations inside nested functions and blocks are not checked',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const onClick = React.useCallback(() => {
                const payload = { id: props.id };
                props.onClick(payload);
              }, [props]);

              return (
                <ul onClick={onClick}>
                  {props.items.map((item) => {
                    const label = item.parts.join(' ');
                    return <li key={item.id}>{label}</li>;
                  })}
                </ul>
              );
            });
          `,
        },
        {
          name: 'a name starting with an underscore is not read',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const { a, ..._rest } = useFilterState();
              const _unused = props.items.filter(Boolean);

              expectType<keyof typeof _rest, never>('=');

              return <div>{a}</div>;
            });
          `,
        },
        {
          name: 'a component with an expression body has nothing to check',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => (
              <div>{props.items.filter((x) => x.visible).length}</div>
            ));
          `,
        },
        {
          name: 'an async component cannot call hooks',
          code: dedent`
            export default async function Page() {
              const data = await getData();
              const items = data.items.filter(Boolean);
              return <div>{items}</div>;
            }
          `,
        },
        {
          name: 'a capitalized function that draws no JSX is not a component',
          code: dedent`
            export const Ymd = (d) => {
              const parts = d.split('-');
              return parts;
            };

            function Point(x, y) {
              const pair = [x, y];
              return pair;
            }
          `,
        },
        {
          name: 'a lowercase function is not a component',
          code: dedent`
            const render = (props) => {
              const xs = props.items.filter((x) => x.visible);
              return <div>{xs.length}</div>;
            };
          `,
        },
        {
          name: 'React.memo not imported from react is not a component wrapper',
          code: dedent`
            import { memo } from 'my-lib';

            const MyComponent = memo((props) => {
              const xs = props.items.filter((x) => x.visible);
              return <div>{xs.length}</div>;
            });
          `,
        },
      ],
      invalid: [
        {
          name: 'the product list page of the synstate-router sample app',
          code: dedent`
            export const ProductListPage = React.memo<Props>((props) => {
              const { list } = props;

              const { q, sort, page } = list.search;

              const found = products
                .filter(
                  (p) => q === undefined || p.name.toLowerCase().includes(q.toLowerCase()),
                )
                .toSorted((a, b) =>
                  sort === 'price' ? a.price - b.price : a.name.localeCompare(b.name),
                );

              const shown = found.slice(
                (page - 1) * productsPerPage,
                page * productsPerPage,
              );

              const lastPage = Math.max(1, Math.ceil(found.length / productsPerPage));

              return <section>{shown.length}{lastPage}</section>;
            });
          `,
          errors: [
            {
              messageId: 'requireUseMemo',
              data: { name: 'found' },
              line: 6,
            },
            {
              messageId: 'requireUseMemo',
              data: { name: 'shown' },
              line: 14,
            },
          ],
        },
        {
          name: 'the product page of the synstate-router sample app',
          code: dedent`
            export const ProductPage = React.memo<Props>((props) => {
              const { productId } = props;

              const index = products.findIndex((p) => p.id === productId);

              const product = products[index];

              return <section>{product?.name}</section>;
            });
          `,
          errors: [
            {
              messageId: 'requireUseMemo',
              data: { name: 'index' },
              line: 4,
            },
          ],
        },
        {
          name: 'non-primitive values',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const style = { color: props.color };
              const items = [props.a, props.b];
              const onClick = () => props.onClick(props.id);
              const handler = function () {};
              const date = new Date(props.time);
              const pattern = /a+/u;
              const element = <span>{props.label}</span>;
              const fallback = props.items ?? [];
              const tagged = css\`color: red;\`;

              return <div style={style} onClick={onClick}>{items}{element}</div>;
            });
          `,
          errors: [
            { messageId: 'requireUseMemo', data: { name: 'style' }, line: 2 },
            { messageId: 'requireUseMemo', data: { name: 'items' }, line: 3 },
            {
              messageId: 'requireUseMemo',
              data: { name: 'onClick' },
              line: 4,
            },
            {
              messageId: 'requireUseMemo',
              data: { name: 'handler' },
              line: 5,
            },
            { messageId: 'requireUseMemo', data: { name: 'date' }, line: 6 },
            {
              messageId: 'requireUseMemo',
              data: { name: 'pattern' },
              line: 7,
            },
            {
              messageId: 'requireUseMemo',
              data: { name: 'element' },
              line: 8,
            },
            {
              messageId: 'requireUseMemo',
              data: { name: 'fallback' },
              line: 9,
            },
            {
              messageId: 'requireUseMemo',
              data: { name: 'tagged' },
              line: 10,
            },
          ],
        },
        {
          name: 'calls of functions that are not hooks',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const label = formatDate(props.date);
              const joined = props.parts.join(' ');
              const max = Math.max(...props.values);
              const text = String(props.items.map((x) => x.name));
              const list = props.items.filter(Boolean).toString();

              return <div>{label}{joined}{max}{text}</div>;
            });
          `,
          errors: [
            { messageId: 'requireUseMemo', data: { name: 'label' }, line: 2 },
            {
              messageId: 'requireUseMemo',
              data: { name: 'joined' },
              line: 3,
            },
            { messageId: 'requireUseMemo', data: { name: 'max' }, line: 4 },
            { messageId: 'requireUseMemo', data: { name: 'text' }, line: 5 },
            { messageId: 'requireUseMemo', data: { name: 'list' }, line: 6 },
          ],
        },
        {
          name: 'destructuring that builds a value',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const { items = [], title = 'Untitled' } = props;
              const { onClick, ...rest } = props;
              const [head, ...tail] = props.list;

              return <div {...rest}>{items}{title}{head}{tail}</div>;
            });
          `,
          errors: [
            { messageId: 'requireUseMemo', data: { name: 'items' }, line: 2 },
            { messageId: 'requireUseMemo', data: { name: 'rest' }, line: 3 },
            { messageId: 'requireUseMemo', data: { name: 'tail' }, line: 4 },
          ],
        },
        {
          name: 'every name bound by destructuring a value that is not O(1)',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const { a, b: [c], ...d } = props.items.find(Boolean);
              const [e = 1, , ...f] = compute(props.x);

              return <div>{a}{c}{d}{e}{f}</div>;
            });
          `,
          errors: [
            { messageId: 'requireUseMemo', data: { name: 'a' }, line: 2 },
            { messageId: 'requireUseMemo', data: { name: 'c' }, line: 2 },
            { messageId: 'requireUseMemo', data: { name: 'd' }, line: 2 },
            { messageId: 'requireUseMemo', data: { name: 'e' }, line: 3 },
            { messageId: 'requireUseMemo', data: { name: 'f' }, line: 3 },
          ],
        },
        {
          name: 'every kind of component definition',
          code: dedent`
            import { memo, forwardRef } from 'react';

            const A = memo((props) => {
              const xs = props.items.filter(Boolean);
              return <div>{xs}</div>;
            });

            const B = React.memo(
              React.forwardRef((props, ref) => {
                const xs = props.items.filter(Boolean);
                return <div ref={ref}>{xs}</div>;
              }),
            );

            const C = forwardRef((props, ref) => {
              const xs = props.items.filter(Boolean);
              return <div ref={ref}>{xs}</div>;
            });

            const D = (props) => {
              const xs = props.items.filter(Boolean);
              return <div>{xs}</div>;
            };

            function E(props) {
              const xs = props.items.filter(Boolean);
              return <div>{xs}</div>;
            }

            const F = function (props) {
              const xs = props.items.filter(Boolean);
              return <div>{xs}</div>;
            };
          `,
          errors: [
            { messageId: 'requireUseMemo', line: 4 },
            { messageId: 'requireUseMemo', line: 10 },
            { messageId: 'requireUseMemo', line: 16 },
            { messageId: 'requireUseMemo', line: 21 },
            { messageId: 'requireUseMemo', line: 26 },
            { messageId: 'requireUseMemo', line: 31 },
          ],
        },
        {
          name: 'a capitalized function drawing with React.createElement',
          code: dedent`
            const Foo = (props) => {
              const style = { color: props.color };
              return React.createElement('div', { style });
            };
          `,
          errors: [{ messageId: 'requireUseMemo', data: { name: 'style' } }],
        },
        {
          name: 'a capitalized component whose JSX is only in a nested callback',
          code: dedent`
            const List = (props) => {
              const xs = props.items.filter(Boolean);
              return xs.map((x) => <li key={x.id}>{x.name}</li>);
            };
          `,
          errors: [{ messageId: 'requireUseMemo', data: { name: 'xs' } }],
        },
        {
          name: 'a custom hook is checked too',
          code: dedent`
            const useVisibleItems = (items) => {
              const visible = items.filter((x) => x.visible);
              return visible;
            };

            function useOptions(a) {
              const options = { a };
              return options;
            }
          `,
          errors: [
            {
              messageId: 'requireUseMemo',
              data: { name: 'visible' },
              line: 2,
            },
            {
              messageId: 'requireUseMemo',
              data: { name: 'options' },
              line: 7,
            },
          ],
        },
      ],
    });
  });

  describe('options', () => {
    tester.run(ruleName, requireUseMemoRule, {
      valid: [
        {
          name: 'allowedCalls adds to the default allowed functions',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const label = formatPrice(props.price);
              const half = Num.div(props.value, 2);
              const max = Math.max(props.a, props.b);
              const iso = props.date.toISOString();

              return <div>{label}{half}{max}{iso}</div>;
            });
          `,
          options: [
            { allowedCalls: ['formatPrice', 'Num.*', '*.toISOString'] },
          ],
        },
        {
          name: 'only the first function argument of a wrapper is a component',
          code: dedent`
            const MyComponent = memoNamed('MyComponent', (props) => <div />, (a, b) => {
              const keys = Object.keys(a);
              return keys.length === Object.keys(b).length;
            });
          `,
          options: [{ componentWrappers: ['memoNamed'] }],
        },
        {
          name: 'componentWrappers names a higher order component',
          code: dedent`
            const MyComponent = memoNamed<Props>('MyComponent', (props) => {
              const count = props.items.length;
              return <div>{count}</div>;
            });
          `,
          options: [{ componentWrappers: ['memoNamed'] }],
        },
      ],
      invalid: [
        {
          name: 'componentWrappers makes the function given to it a component',
          code: dedent`
            const MyComponent = memoNamed<Props>('MyComponent', (props) => {
              const xs = props.items.filter(Boolean);
              return <div>{xs}</div>;
            });
          `,
          options: [{ componentWrappers: ['memoNamed'] }],
          errors: [{ messageId: 'requireUseMemo', data: { name: 'xs' } }],
        },
        {
          name: 'an allowed function called with an argument that is not O(1)',
          code: dedent`
            const MyComponent = React.memo<Props>((props) => {
              const label = formatPrice(props.prices.reduce((a, b) => a + b, 0));

              return <div>{label}</div>;
            });
          `,
          options: [{ allowedCalls: ['formatPrice'] }],
          errors: [{ messageId: 'requireUseMemo', data: { name: 'label' } }],
        },
      ],
    });
  });
});

describe(`${ruleName} through type wrappers`, () => {
  tester.run(ruleName, requireUseMemoRule, {
    valid: [
      {
        name: 'wrapped O(1) expressions and hook calls',
        code: dedent`
          const MyComponent = React.memo<Props>((props) => {
            const a = props.value as number;
            const b = props.value satisfies number;
            const c = props.value!;
            const d = (props.value as number) + (props.other! satisfies number);
            const e = React.useMemo(() => props.items.filter(Boolean), [props.items]) as readonly Item[];
            const f = (useValue as typeof useValue)();
            const g = (Math.max as (a: number, b: number) => number)(props.a, props.b);

            return <div>{a}{b}{c}{d}{e}{f}{g}</div>;
          });
        `,
      },
    ],
    invalid: [
      {
        name: 'wrapped values that are not O(1)',
        code: dedent`
          const MyComponent = React.memo<Props>((props) => {
            const a = props.items.filter(Boolean) as readonly Item[];
            const b = ({ x: props.x }) satisfies Point;
            const c = props.items.find(Boolean)!;
            const d = [props.a] as const;

            return <div>{a}{b}{c}{d}</div>;
          });
        `,
        errors: [
          { messageId: 'requireUseMemo', data: { name: 'a' } },
          { messageId: 'requireUseMemo', data: { name: 'b' } },
          { messageId: 'requireUseMemo', data: { name: 'c' } },
          { messageId: 'requireUseMemo', data: { name: 'd' } },
        ],
      },
      {
        name: 'a wrapped component',
        code: dedent`
          const A = React.memo(((props: Props) => {
            const xs = props.items.filter(Boolean);
            return <div>{xs}</div>;
          }) as React.FC<Props>);

          const B = (React.memo as typeof React.memo)((props: Props) => {
            const xs = props.items.filter(Boolean);
            return <div>{xs}</div>;
          });

          const C = ((props: Props) => {
            const xs = props.items.filter(Boolean);
            return <div>{xs}</div>;
          }) satisfies React.FC<Props>;
        `,
        errors: [
          { messageId: 'requireUseMemo', line: 2 },
          { messageId: 'requireUseMemo', line: 7 },
          { messageId: 'requireUseMemo', line: 12 },
        ],
      },
    ],
  });
});
