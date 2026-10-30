import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferDerive } from './prefer-derive.mjs';

const ruleTester = new RuleTester();

ruleTester.run('prefer-derive', preferDerive, {
  valid: [
    {
      name: 'combine alone, whose tuple is the value wanted',
      code: dedent`
        import { combine } from 'synstate';
        const pair$ = combine([a$, b$]);
      `,
    },
    {
      name: 'derive already',
      code: dedent`
        import { derive } from 'synstate';
        const sum$ = derive([a$, b$], (a, b) => a + b);
      `,
    },
    {
      name: 'another operator after combine',
      code: dedent`
        import { combine, filter } from 'synstate';
        const pair$ = combine([a$, b$]).pipe(filter(([a]) => a > 0));
      `,
    },
    {
      name: 'map after an observable that is not combine',
      code: dedent`
        import { map, merge } from 'synstate';
        const x$ = merge([a$, b$]).pipe(map((x) => x * 2));
      `,
    },
    {
      name: 'a combine and a map that are not synstate’s',
      code: dedent`
        import { combine, map } from './local';
        const sum$ = combine([a$, b$]).pipe(map(([a, b]) => a + b));
      `,
    },
    {
      name: 'a map to a constant or an identity map, which other rules report',
      code: dedent`
        import { combine, map } from 'synstate';
        const t$ = combine([a$, b$]).pipe(map(() => true));
        const u$ = combine([a$, b$]).pipe(map((_) => 1));
        const v$ = combine([a$, b$]).pipe(map((xs) => xs));
      `,
    },
    {
      name: 'a shadowed combine',
      code: dedent`
        import { map } from 'synstate';
        const combine = (xs: readonly unknown[]) => xs;
        const sum$ = combine([a$, b$]).pipe(map(([a, b]) => a + b));
      `,
    },
  ],
  invalid: [
    {
      name: 'an array pattern becomes the parameters',
      code: dedent`
        import { combine, map } from 'synstate';
        const sum$ = combine([a$, b$]).pipe(map(([a, b]) => a + b));
      `,
      output: dedent`
        import { derive } from 'synstate';
        import { combine, map } from 'synstate';
        const sum$ = derive([a$, b$], (a, b) => a + b);
      `,
      errors: [{ messageId: 'preferDerive' }],
    },
    {
      name: 'derive already imported, and a rest element',
      code: dedent`
        import { combine, derive, map } from 'synstate';
        const r$ = combine(all).pipe(map(([s, ...rest]) => rest[s] ?? 0));
      `,
      output: dedent`
        import { combine, derive, map } from 'synstate';
        const r$ = derive(all, (s, ...rest) => rest[s] ?? 0);
      `,
      errors: [{ messageId: 'preferDerive' }],
    },
    {
      name: 'a name becomes a rest parameter',
      code: dedent`
        import { combine, derive, map } from 'synstate';
        const n$ = combine([a$, b$]).pipe(map((xs) => xs.length));
        const m$ = combine([a$, b$]).pipe(map(xs => xs.length));
      `,
      output: dedent`
        import { combine, derive, map } from 'synstate';
        const n$ = derive([a$, b$], (...xs) => xs.length);
        const m$ = derive([a$, b$], (...xs) => xs.length);
      `,
      errors: [{ messageId: 'preferDerive' }, { messageId: 'preferDerive' }],
    },
    {
      name: '`equals` is passed on, and the import is added once',
      code: dedent`
        import { combine, map } from 'synstate';
        const p$ = combine([a$, b$]).pipe(
          map(([a, b]) => ({ a, b }), { equals: (x, y) => x.a === y.a }),
        );
        const q$ = combineLatestLike;
        const r$ = combine([a$]).pipe(map(([a]) => a + 1));
        const t$ = combine([a$]).pipe(map(() => Date.now()));
      `,
      output: dedent`
        import { derive } from 'synstate';
        import { combine, map } from 'synstate';
        const p$ = derive([a$, b$], (a, b) => ({ a, b }), { equals: (x, y) => x.a === y.a });
        const q$ = combineLatestLike;
        const r$ = derive([a$], (a) => a + 1);
        const t$ = derive([a$], () => Date.now());
      `,
      errors: [
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
      ],
    },
    {
      name: 'the alias combineLatest, and a renamed import',
      code: dedent`
        import { combineLatest, derive as d, map as m } from 'synstate';
        const s$ = combineLatest([a$, b$]).pipe(m(([a, b]) => a - b));
      `,
      output: dedent`
        import { combineLatest, derive as d, map as m } from 'synstate';
        const s$ = d([a$, b$], (a, b) => a - b);
      `,
      errors: [{ messageId: 'preferDerive' }],
    },
    {
      name: 'a namespace import',
      code: dedent`
        import * as S from 'synstate';
        const s$ = S.combine([a$, b$]).pipe(S.map(([a, b]) => a * b));
      `,
      output: dedent`
        import * as S from 'synstate';
        const s$ = S.derive([a$, b$], (a, b) => a * b);
      `,
      errors: [{ messageId: 'preferDerive' }],
    },
    {
      name: 'reported, not fixed: a function reference',
      code: dedent`
        import { combine, map } from 'synstate';
        const s$ = combine([a$, b$]).pipe(map(sum));
      `,
      output: null,
      errors: [{ messageId: 'preferDerive' }],
    },
    {
      name: 'reported, not fixed: a typed parameter, a hole, a default, a trailing comma, a `?`',
      code: dedent`
        import { combine, map } from 'synstate';
        const s$ = combine([a$, b$]).pipe(map(([a, b]: readonly [number, number]) => a + b));
        const t$ = combine([a$, b$]).pipe(map(([, b]) => b));
        const u$ = combine([a$, b$]).pipe(map(([a, b] = [0, 0]) => a + b));
        const v$ = combine([a$, b$]).pipe(map((xs,) => xs.length));
        const w$ = combine([a$, b$]).pipe(map(([a, b]?) => a + b));
        const x$ = combine([a$, b$]).pipe(map((xs?) => xs.length));
      `,
      output: null,
      errors: [
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
      ],
    },
    {
      name: 'reported, not fixed: a type wrapper or a comment between the calls',
      code: dedent`
        import { combine, map } from 'synstate';
        const s$ = (combine([a$, b$]) as X).pipe(map(([a, b]) => a + b));
        const t$ = combine([a$, b$]) // the pair
          .pipe(map(([a, b]) => a + b));
      `,
      output: null,
      errors: [{ messageId: 'preferDerive' }, { messageId: 'preferDerive' }],
    },
    {
      name: 'a comment inside the function is kept',
      code: dedent`
        import { combine, derive, map } from 'synstate';
        const s$ = combine([a$, b$]).pipe(map(([a, b]) => /* sum */ a + b));
      `,
      output: dedent`
        import { combine, derive, map } from 'synstate';
        const s$ = derive([a$, b$], (a, b) => /* sum */ a + b);
      `,
      errors: [{ messageId: 'preferDerive' }],
    },
    {
      name: 'reported, not fixed: type arguments',
      code: dedent`
        import { combine, map } from 'synstate';
        const s$ = combine<readonly [A, B]>([a$, b$]).pipe(map(([a, b]) => a + b));
        const t$ = combine([a$, b$]).pipe(map<readonly [number, number], number>(([a, b]) => a + b));
        const u$ = combine([a$, b$]).pipe<number | undefined>(map(([a, b]) => a + b));
      `,
      output: null,
      errors: [
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
        { messageId: 'preferDerive' },
      ],
    },
    {
      name: 'reported, not fixed: combine or its `.pipe` in parentheses',
      code: dedent`
        import { combine, map } from 'synstate';
        const s$ = (combine([a$, b$])).pipe(map(([a, b]) => a + b));
        const t$ = (combine([a$, b$]).pipe)(map(([a, b]) => a + b));
      `,
      output: null,
      errors: [{ messageId: 'preferDerive' }, { messageId: 'preferDerive' }],
    },
  ],
});

describe('prefer-derive through type wrappers', () => {
  ruleTester.run('prefer-derive', preferDerive, {
    valid: [],
    invalid: [
      {
        name: '`map(...)` in `as`, `satisfies` or `!`: reported, not fixed',
        code: dedent`
          import { combine, map } from 'synstate';
          const s$ = combine([a$, b$]).pipe(map(([a, b]) => a + b) as Op);
          const t$ = combine([a$, b$]).pipe(map(([a, b]) => a + b) satisfies Op);
          const u$ = combine([a$, b$]).pipe(map(([a, b]) => a + b)!);
        `,
        errors: [
          { messageId: 'preferDerive' },
          { messageId: 'preferDerive' },
          { messageId: 'preferDerive' },
        ],
        output: null,
      },
      {
        name: '`combine(...)` in `as`, `satisfies` or `!`: reported, not fixed',
        code: dedent`
          import { combine, map } from 'synstate';
          const s$ = (combine([a$, b$]) satisfies X).pipe(map(([a, b]) => a + b));
          const t$ = combine([a$, b$])!.pipe(map(([a, b]) => a + b));
        `,
        errors: [{ messageId: 'preferDerive' }, { messageId: 'preferDerive' }],
        output: null,
      },
      {
        name: 'the mapping function in `as`: reported, not fixed',
        code: dedent`
          import { combine, map } from 'synstate';
          const s$ = combine([a$, b$]).pipe(map((([a, b]) => a + b) as Fn));
        `,
        errors: [{ messageId: 'preferDerive' }],
        output: null,
      },
      {
        name: 'the callees in `as`: reported, not fixed',
        code: dedent`
          import { combine, map } from 'synstate';
          const s$ = (combine as C)([a$, b$]).pipe(map(([a, b]) => a + b));
          const t$ = combine([a$, b$]).pipe((map as M)(([a, b]) => a + b));
        `,
        errors: [{ messageId: 'preferDerive' }, { messageId: 'preferDerive' }],
        output: null,
      },
      {
        name: 'a namespace callee in `as`: reported, not fixed',
        code: dedent`
          import * as S from 'synstate';
          const s$ = (S.combine as C)([a$, b$]).pipe(S.map(([a, b]) => a + b));
        `,
        errors: [{ messageId: 'preferDerive' }],
        output: null,
      },
      {
        name: 'a return type annotation and a wrapped body are kept',
        code: dedent`
          import { combine, derive, map } from 'synstate';
          const s$ = combine([a$, b$]).pipe(map(([a, b]): number => (a + b) as number));
        `,
        errors: [{ messageId: 'preferDerive' }],
        output: dedent`
          import { combine, derive, map } from 'synstate';
          const s$ = derive([a$, b$], (a, b): number => (a + b) as number);
        `,
      },
    ],
  });
});
