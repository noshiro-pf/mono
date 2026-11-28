import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noConstantMap } from './no-constant-map.mjs';

const ruleTester = new RuleTester();

ruleTester.run('no-constant-map', noConstantMap, {
  valid: [
    {
      name: 'a result computed from the value',
      code: dedent`
        import { map } from 'synstate';
        const doubled$ = a$.pipe(map((x) => x * 2));
      `,
    },
    {
      name: 'a call, which may return another value each time',
      code: dedent`
        import { map } from 'synstate';
        const now$ = tick$.pipe(map(() => Date.now()));
      `,
    },
    {
      name: 'an object literal, a new object each time',
      code: dedent`
        import { map } from 'synstate';
        const action$ = reset$.pipe(map(() => ({ type: 'reset' }) as const));
      `,
    },
    {
      name: 'an array literal, a new array each time',
      code: dedent`
        import { map } from 'synstate';
        const empty$ = reset$.pipe(map(() => []));
      `,
    },
    {
      name: 'a regular expression literal, a new object each time',
      code: dedent`
        import { map } from 'synstate';
        const pattern$ = reset$.pipe(map(() => /a/u));
      `,
    },
    {
      name: 'a template literal with an expression',
      code: dedent`
        import { map } from 'synstate';
        const label$ = reset$.pipe(map(() => \`at \${String(Date.now())}\`));
      `,
    },
    {
      name: 'a variable that can be reassigned',
      code: dedent`
        import { map } from 'synstate';
        let mut_count = 0;
        const count$ = tick$.pipe(map(() => mut_count));
      `,
    },
    {
      name: 'a parameter of an enclosing function',
      code: dedent`
        import { map } from 'synstate';
        const constantOf = (value: number) => tick$.pipe(map(() => value));
      `,
    },
    {
      name: 'a global that is not `undefined`',
      code: dedent`
        import { map } from 'synstate';
        const location$ = tick$.pipe(map(() => location));
      `,
    },
    {
      name: 'options given: the author decided',
      code: dedent`
        import { map } from 'synstate';
        const one$ = click$.pipe(map(() => 1, { equals: () => false }));
      `,
    },
    {
      name: 'a destructured name that hides a constant is not one',
      code: dedent`
        import { map } from 'synstate';
        const detail = 'reset';
        const reset$ = click$.pipe(map(({ detail }) => detail));
      `,
    },
    {
      name: '`-` or `+` of a name, which may call a `valueOf`',
      code: dedent`
        import { map } from 'synstate';
        const tick = { valueOf: () => Date.now() };
        const a$ = x$.pipe(map(() => +tick));
        const b$ = x$.pipe(map(() => -(tick as number)));
      `,
    },
    {
      name: '`+` of a bigint, which throws',
      code: dedent`
        import { map } from 'synstate';
        const N = 1n;
        const a$ = x$.pipe(map(() => +N));
        const b$ = x$.pipe(map(() => +(-1n)));
        const c$ = x$.pipe(map(() => +(-N)));
        const d$ = x$.pipe(map(() => +(1n as bigint)));
        const e$ = x$.pipe(map(() => +(N satisfies bigint)));
        const f$ = x$.pipe(map(() => +N!));
        const W = 1n as bigint;
        const g$ = x$.pipe(map(() => +W));
      `,
    },
    {
      name: '`-` or `+` of a destructured `const`, whose value is not its initializer',
      code: dedent`
        import { map } from 'synstate';
        const { x = { valueOf: () => Date.now() } } = 0;
        const [y = { valueOf: () => Date.now() }] = '';
        const a$ = x$.pipe(map(() => +x));
        const b$ = x$.pipe(map(() => -x));
        const c$ = x$.pipe(map(() => +y));
      `,
    },
    {
      name: 'a `const` that names itself or another in a loop',
      code: dedent`
        import { map } from 'synstate';
        const N = N;
        const A = -B;
        const B = -A;
        const a$ = x$.pipe(map(() => +N));
        const b$ = x$.pipe(map(() => +A));
      `,
    },
    {
      name: 'a `map` that is not synstate’s',
      code: dedent`
        import { map } from 'other';
        const one$ = click$.pipe(map(() => 1));
      `,
    },
    {
      name: 'a local `map` shadowing the import',
      code: dedent`
        import { map } from 'synstate';
        const f = (map: (g: () => number) => unknown) => map(() => 1);
      `,
    },
    {
      name: 'an array method',
      code: dedent`
        const ones = [1, 2].map(() => 1);
      `,
    },
    {
      name: 'a block body that does more than return',
      code: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(
          map(() => {
            log();
            return 'reset';
          }),
        );
      `,
    },
    {
      name: 'an async arrow, a new promise each time',
      code: dedent`
        import { map } from 'synstate';
        const p$ = click$.pipe(map(async () => 1));
      `,
    },
    {
      name: 'an async function expression, a new promise each time',
      code: dedent`
        import { map } from 'synstate';
        const p$ = click$.pipe(map(async function () { return 1; }));
      `,
    },
    {
      name: 'a member of a constant object, whose property may be reassigned',
      code: dedent`
        import { map } from 'synstate';
        const Status = { idle: 'idle' };
        const status$ = reset$.pipe(map(() => Status.idle));
      `,
    },
    {
      name: 'a generator function',
      code: dedent`
        import { map } from 'synstate';
        const g$ = click$.pipe(map(function* () { return 1; }));
      `,
    },
  ],
  invalid: [
    {
      name: 'a block body that only returns a constant',
      code: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map(() => { return 'reset' as const; }));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map(() => { return 'reset' as const; }, { equals: () => false }));
      `,
    },
    {
      name: 'an empty block, which returns undefined',
      code: dedent`
        import { map } from 'synstate';
        const tick$ = click$.pipe(map(() => {}));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const tick$ = click$.pipe(map(() => {}, { equals: () => false }));
      `,
    },
    {
      name: 'a bare return',
      code: dedent`
        import { map } from 'synstate';
        const tick$ = click$.pipe(map(function () { return; }));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const tick$ = click$.pipe(map(function () { return; }, { equals: () => false }));
      `,
    },
    {
      name: 'a parameter with a default, whose code changes nothing returned',
      code: dedent`
        import { map } from 'synstate';
        const one$ = click$.pipe(map((_ = sideEffect()) => 1));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const one$ = click$.pipe(map((_ = sideEffect()) => 1, { equals: () => false }));
      `,
    },
    {
      name: 'a destructured parameter',
      code: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map(({ detail }) => 'reset'));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map(({ detail }) => 'reset', { equals: () => false }));
      `,
    },
    {
      name: 'a rest parameter',
      code: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map((..._args) => 'reset'));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map((..._args) => 'reset', { equals: () => false }));
      `,
    },
    {
      name: 'a function expression that returns a constant',
      code: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map(function () { return 'reset'; }));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const reset$ = click$.pipe(map(function () { return 'reset'; }, { equals: () => false }));
      `,
    },
    {
      name: 'a boolean literal',
      code: dedent`
        import { map } from 'synstate';
        const started$ = fetch$.pipe(map(() => true));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const started$ = fetch$.pipe(map(() => true, { equals: () => false }));
      `,
    },
    {
      name: 'a string literal `as const`',
      code: dedent`
        import { map } from 'synstate';
        const action$ = reset$.pipe(map(() => 'reset' as const));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const action$ = reset$.pipe(map(() => 'reset' as const, { equals: () => false }));
      `,
    },
    {
      name: 'a parameter that is not read',
      code: dedent`
        import { map } from 'synstate';
        const off$ = closed$.pipe(map((_) => false));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const off$ = closed$.pipe(map((_) => false, { equals: () => false }));
      `,
    },
    {
      name: 'a `const`, an import and `undefined`',
      code: dedent`
        import { map } from 'synstate';
        import { LOADING } from './status.mjs';
        const NONE = 'none';
        const a$ = x$.pipe(map(() => NONE));
        const b$ = x$.pipe(map(() => LOADING));
        const c$ = x$.pipe(map(() => undefined));
      `,
      errors: [
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
      ],
      output: dedent`
        import { map } from 'synstate';
        import { LOADING } from './status.mjs';
        const NONE = 'none';
        const a$ = x$.pipe(map(() => NONE, { equals: () => false }));
        const b$ = x$.pipe(map(() => LOADING, { equals: () => false }));
        const c$ = x$.pipe(map(() => undefined, { equals: () => false }));
      `,
    },
    {
      name: 'a negative number, `null`, a plain template literal, `-` of `!` and of a `const` number',
      code: dedent`
        import { map } from 'synstate';
        const flag = true;
        const OFFSET = 1;
        const ONE = \`1\`;
        const BIG = 1n;
        const a$ = x$.pipe(map(() => -1));
        const b$ = x$.pipe(map(() => null));
        const c$ = x$.pipe(map(() => \`idle\`));
        const d$ = x$.pipe(map(() => -!flag));
        const e$ = x$.pipe(map(() => -OFFSET));
        const f$ = x$.pipe(map(() => +-!flag));
        const g$ = x$.pipe(map(() => -\`1\`));
        const h$ = x$.pipe(map(() => +ONE));
        const i$ = x$.pipe(map(() => -1n));
        const j$ = x$.pipe(map(() => -BIG));
      `,
      errors: [
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
      ],
      output: dedent`
        import { map } from 'synstate';
        const flag = true;
        const OFFSET = 1;
        const ONE = \`1\`;
        const BIG = 1n;
        const a$ = x$.pipe(map(() => -1, { equals: () => false }));
        const b$ = x$.pipe(map(() => null, { equals: () => false }));
        const c$ = x$.pipe(map(() => \`idle\`, { equals: () => false }));
        const d$ = x$.pipe(map(() => -!flag, { equals: () => false }));
        const e$ = x$.pipe(map(() => -OFFSET, { equals: () => false }));
        const f$ = x$.pipe(map(() => +-!flag, { equals: () => false }));
        const g$ = x$.pipe(map(() => -\`1\`, { equals: () => false }));
        const h$ = x$.pipe(map(() => +ONE, { equals: () => false }));
        const i$ = x$.pipe(map(() => -1n, { equals: () => false }));
        const j$ = x$.pipe(map(() => -BIG, { equals: () => false }));
      `,
    },
    {
      name: 'a namespace import',
      code: dedent`
        import * as S from 'synstate';
        const on$ = opened$.pipe(S.map(() => true));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import * as S from 'synstate';
        const on$ = opened$.pipe(S.map(() => true, { equals: () => false }));
      `,
    },
    {
      name: '`map` under an alias',
      code: dedent`
        import { map as project } from 'synstate';
        const on$ = opened$.pipe(project(() => true));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map as project } from 'synstate';
        const on$ = opened$.pipe(project(() => true, { equals: () => false }));
      `,
    },
    {
      name: 'a comment in the function stays',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map(() /* why */ => true));
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map(() /* why */ => true, { equals: () => false }));
      `,
    },
    {
      name: 'a trailing comma after the function',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(
          map(
            () => true,
          ),
        );
      `,
      errors: [{ messageId: 'constantMap' }],
      output: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(
          map(
            () => true, { equals: () => false },
          ),
        );
      `,
    },
  ],
});

describe('no-constant-map through type wrappers', () => {
  ruleTester.run('no-constant-map', noConstantMap, {
    valid: [
      {
        name: 'a call that only a wrapper makes look constant',
        code: dedent`
          import { map } from 'synstate';
          const now$ = tick$.pipe(map(() => Date.now() as 0));
        `,
      },
    ],
    invalid: [
      {
        name: 'a body in `satisfies`',
        code: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => true satisfies boolean));
        `,
        errors: [{ messageId: 'constantMap' }],
        output: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => true satisfies boolean, { equals: () => false }));
        `,
      },
      {
        name: 'a body in parentheses',
        code: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => (true)));
        `,
        errors: [{ messageId: 'constantMap' }],
        output: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => (true), { equals: () => false }));
        `,
      },
      {
        name: 'the function in `as`',
        code: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map((() => true) as () => boolean));
        `,
        errors: [{ messageId: 'constantMap' }],
        output: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map((() => true) as () => boolean, { equals: () => false }));
        `,
      },
      {
        name: 'the function in parentheses',
        code: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map((() => true)));
        `,
        errors: [{ messageId: 'constantMap' }],
        output: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe(map((() => true), { equals: () => false }));
        `,
      },
      {
        name: 'a `const` with `!`',
        code: dedent`
          import { map } from 'synstate';
          const NONE = 'none' as string | undefined;
          const a$ = x$.pipe(map(() => NONE!));
        `,
        errors: [{ messageId: 'constantMap' }],
        output: dedent`
          import { map } from 'synstate';
          const NONE = 'none' as string | undefined;
          const a$ = x$.pipe(map(() => NONE!, { equals: () => false }));
        `,
      },
      {
        name: 'a callee in `as`',
        code: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe((map as typeof map)(() => true));
        `,
        errors: [{ messageId: 'constantMap' }],
        output: dedent`
          import { map } from 'synstate';
          const on$ = opened$.pipe((map as typeof map)(() => true, { equals: () => false }));
        `,
      },
    ],
  });
});
