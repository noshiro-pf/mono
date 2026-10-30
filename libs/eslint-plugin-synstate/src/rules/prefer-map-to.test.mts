import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferMapTo } from './prefer-map-to.mjs';

const ruleTester = new RuleTester();

ruleTester.run('prefer-map-to', preferMapTo, {
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
      name: '`equals` given: the author decided',
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
      errors: [{ messageId: 'preferMapTo' }],
      output: dedent`
        import { map, mapTo } from 'synstate';
        const started$ = fetch$.pipe(mapTo(true));
      `,
    },
    {
      name: 'a string literal `as const`, the wrapper kept',
      code: dedent`
        import { map } from 'synstate';
        const action$ = reset$.pipe(map(() => 'reset' as const));
      `,
      errors: [{ messageId: 'preferMapTo' }],
      output: dedent`
        import { map, mapTo } from 'synstate';
        const action$ = reset$.pipe(mapTo('reset' as const));
      `,
    },
    {
      name: '`mapTo` already imported, under an alias',
      code: dedent`
        import { map, mapTo as constant } from 'synstate';
        const zero$ = reset$.pipe(map(() => 0));
      `,
      errors: [{ messageId: 'preferMapTo' }],
      output: dedent`
        import { map, mapTo as constant } from 'synstate';
        const zero$ = reset$.pipe(constant(0));
      `,
    },
    {
      name: 'a parameter that is not read',
      code: dedent`
        import { map, mapTo } from 'synstate';
        const off$ = closed$.pipe(map((_) => false));
      `,
      errors: [{ messageId: 'preferMapTo' }],
      output: dedent`
        import { map, mapTo } from 'synstate';
        const off$ = closed$.pipe(mapTo(false));
      `,
    },
    {
      name: 'a `const`, an import and `undefined`',
      code: dedent`
        import { map, mapTo } from 'synstate';
        import { LOADING } from './status.mjs';
        const NONE = 'none';
        const a$ = x$.pipe(map(() => NONE));
        const b$ = x$.pipe(map(() => LOADING));
        const c$ = x$.pipe(map(() => undefined));
      `,
      errors: [
        { messageId: 'preferMapTo' },
        { messageId: 'preferMapTo' },
        { messageId: 'preferMapTo' },
      ],
      output: dedent`
        import { map, mapTo } from 'synstate';
        import { LOADING } from './status.mjs';
        const NONE = 'none';
        const a$ = x$.pipe(mapTo(NONE));
        const b$ = x$.pipe(mapTo(LOADING));
        const c$ = x$.pipe(mapTo(undefined));
      `,
    },
    {
      name: 'a negative number, `null` and a plain template literal',
      code: dedent`
        import { map, mapTo } from 'synstate';
        const a$ = x$.pipe(map(() => -1));
        const b$ = x$.pipe(map(() => null));
        const c$ = x$.pipe(map(() => \`idle\`));
      `,
      errors: [
        { messageId: 'preferMapTo' },
        { messageId: 'preferMapTo' },
        { messageId: 'preferMapTo' },
      ],
      output: dedent`
        import { map, mapTo } from 'synstate';
        const a$ = x$.pipe(mapTo(-1));
        const b$ = x$.pipe(mapTo(null));
        const c$ = x$.pipe(mapTo(\`idle\`));
      `,
    },
    {
      name: 'a namespace import',
      code: dedent`
        import * as S from 'synstate';
        const on$ = opened$.pipe(S.map(() => true));
      `,
      errors: [{ messageId: 'preferMapTo' }],
      output: dedent`
        import * as S from 'synstate';
        const on$ = opened$.pipe(S.mapTo(true));
      `,
    },
    {
      name: '`map` under an alias',
      code: dedent`
        import { map as project, mapTo } from 'synstate';
        const on$ = opened$.pipe(project(() => true));
      `,
      errors: [{ messageId: 'preferMapTo' }],
      output: dedent`
        import { map as project, mapTo } from 'synstate';
        const on$ = opened$.pipe(mapTo(true));
      `,
    },
    {
      name: 'a local `mapTo` that is not synstate’s: reported, not fixed',
      code: dedent`
        import { map } from 'synstate';
        const mapTo = 1;
        const on$ = opened$.pipe(map(() => true));
      `,
      errors: [{ messageId: 'preferMapTo' }],
      output: null,
    },
  ],
});

describe('prefer-map-to through type wrappers', () => {
  ruleTester.run('prefer-map-to', preferMapTo, {
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
        name: 'a body in `satisfies`, the wrapper kept',
        code: dedent`
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(map(() => true satisfies boolean));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(mapTo(true satisfies boolean));
        `,
      },
      {
        name: 'a body in parentheses',
        code: dedent`
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(map(() => (true)));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(mapTo(true));
        `,
      },
      {
        name: 'the function in `as`',
        code: dedent`
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(map((() => true) as () => boolean));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(mapTo(true));
        `,
      },
      {
        name: 'a `const` with `!`',
        code: dedent`
          import { map, mapTo } from 'synstate';
          const NONE = 'none' as string | undefined;
          const a$ = x$.pipe(map(() => NONE!));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import { map, mapTo } from 'synstate';
          const NONE = 'none' as string | undefined;
          const a$ = x$.pipe(mapTo(NONE!));
        `,
      },
      {
        name: 'a callee in `as`: reported, not fixed',
        code: dedent`
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe((map as typeof map)(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: null,
      },
      {
        name: 'a namespace callee in `as`: reported, not fixed',
        code: dedent`
          import * as S from 'synstate';
          const on$ = opened$.pipe((S.map as typeof S.map)(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: null,
      },
    ],
  });
});

describe('prefer-map-to bringing `mapTo` into scope', () => {
  ruleTester.run('prefer-map-to', preferMapTo, {
    valid: [],
    invalid: [
      {
        name: 'a leading directive stays first',
        code: dedent`
          'use client';
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          'use client';
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(mapTo(true));
        `,
      },
      {
        name: 'the name joins the value import, not a type-only one',
        code: dedent`
          import type { Observable } from 'synstate';
          import { map } from 'synstate';
          const on$: Observable<boolean> = opened$.pipe(map(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import type { Observable } from 'synstate';
          import { map, mapTo } from 'synstate';
          const on$: Observable<boolean> = opened$.pipe(mapTo(true));
        `,
      },
      {
        name: 'the name joins the import with value specifiers, not one with only type ones',
        code: dedent`
          import { type Observable } from 'synstate';
          import { map } from 'synstate';
          const on$: Observable<boolean> = opened$.pipe(map(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import { type Observable } from 'synstate';
          import { map, mapTo } from 'synstate';
          const on$: Observable<boolean> = opened$.pipe(mapTo(true));
        `,
      },
      {
        name: 'a comment beside a namespace property stays, since only the property is rewritten',
        code: dedent`
          import * as S from 'synstate';
          const on$ = opened$.pipe(S./* keep */ map(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import * as S from 'synstate';
          const on$ = opened$.pipe(S./* keep */ mapTo(true));
        `,
      },
      {
        name: 'a type-only specifier becomes a value one',
        code: dedent`
          import { map, type mapTo as constant } from 'synstate';
          const on$ = opened$.pipe(map(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import { map, mapTo as constant } from 'synstate';
          const on$ = opened$.pipe(constant(true));
        `,
      },
      {
        name: 'imported by a type-only declaration: reported, not fixed',
        code: dedent`
          import type { mapTo } from 'synstate';
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: null,
      },
      {
        name: 'an aliased type-only import leaves the name free',
        code: dedent`
          import type { mapTo as MapTo } from 'synstate';
          import { map } from 'synstate';
          const on$ = opened$.pipe(map(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: dedent`
          import type { mapTo as MapTo } from 'synstate';
          import { map, mapTo } from 'synstate';
          const on$ = opened$.pipe(mapTo(true));
        `,
      },
      {
        name: 'another synstate export imported under the name: reported, not fixed',
        code: dedent`
          import { map as mapTo } from 'synstate';
          const on$ = opened$.pipe(mapTo(() => true));
        `,
        errors: [{ messageId: 'preferMapTo' }],
        output: null,
      },
      {
        name: 'a comment the fix would delete: reported, not fixed',
        code: dedent`
          import { map, mapTo } from 'synstate';
          const a$ = x$.pipe(map(() /* why */ => true));
          const b$ = x$.pipe((/* keep */ map)(() => true));
          const c$ = x$.pipe(map(() => true /* kept */));
        `,
        errors: [
          { messageId: 'preferMapTo' },
          { messageId: 'preferMapTo' },
          { messageId: 'preferMapTo' },
        ],
        output: dedent`
          import { map, mapTo } from 'synstate';
          const a$ = x$.pipe(map(() /* why */ => true));
          const b$ = x$.pipe((/* keep */ map)(() => true));
          const c$ = x$.pipe(mapTo(true /* kept */));
        `,
      },
      {
        name: 'each fix brings the import itself',
        code: dedent`
          import { map } from 'synstate';
          const a$ = x$.pipe(map(() => true));
          const b$ = y$.pipe(map(() => false));
        `,
        errors: [{ messageId: 'preferMapTo' }, { messageId: 'preferMapTo' }],
        output: [
          dedent`
            import { map, mapTo } from 'synstate';
            const a$ = x$.pipe(mapTo(true));
            const b$ = y$.pipe(map(() => false));
          `,
          dedent`
            import { map, mapTo } from 'synstate';
            const a$ = x$.pipe(mapTo(true));
            const b$ = y$.pipe(mapTo(false));
          `,
        ],
      },
    ],
  });
});
