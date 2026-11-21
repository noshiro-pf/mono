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
      name: 'a block body',
      code: dedent`
        import { map } from 'synstate';
        const one$ = click$.pipe(map(() => { return 1; }));
      `,
    },
    {
      name: 'a parameter with a default, which runs each time',
      code: dedent`
        import { map } from 'synstate';
        const one$ = click$.pipe(map((_ = sideEffect()) => 1));
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
  ],
  invalid: [
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
      name: 'a negative number, `null` and a plain template literal',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map(() => -1));
        const b$ = x$.pipe(map(() => null));
        const c$ = x$.pipe(map(() => \`idle\`));
      `,
      errors: [
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
        { messageId: 'constantMap' },
      ],
      output: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map(() => -1, { equals: () => false }));
        const b$ = x$.pipe(map(() => null, { equals: () => false }));
        const c$ = x$.pipe(map(() => \`idle\`, { equals: () => false }));
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
