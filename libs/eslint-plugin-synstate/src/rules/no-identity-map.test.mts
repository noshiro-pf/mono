import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noIdentityMap } from './no-identity-map.mjs';

const ruleTester = new RuleTester();

ruleTester.run('no-identity-map', noIdentityMap, {
  valid: [
    {
      name: 'a result computed from the value',
      code: dedent`
        import { map } from 'synstate';
        const doubled$ = a$.pipe(map((x) => x * 2));
      `,
    },
    {
      name: 'another variable',
      code: dedent`
        import { map } from 'synstate';
        const y = 1;
        const y$ = a$.pipe(map((x) => y));
      `,
    },
    {
      name: 'a property of the value',
      code: dedent`
        import { map } from 'synstate';
        const mode$ = layout$.pipe(map((layout) => layout.mode));
      `,
    },
    {
      name: 'a destructured parameter',
      code: dedent`
        import { map } from 'synstate';
        const a$ = pair$.pipe(map(([a]) => a));
      `,
    },
    {
      name: 'a parameter with a default',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map((x = 0) => x));
      `,
    },
    {
      name: 'an async function, which returns a promise',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map(async (x) => x));
      `,
    },
    {
      name: 'a block that does more than return the value',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(
          map((x) => {
            console.log(x);
            return x;
          }),
        );
      `,
    },
    {
      name: '`equals` given: the author decided',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map((x) => x, { equals: () => false }));
      `,
    },
    {
      name: 'a map that is not synstate’s',
      code: dedent`
        import { map } from 'rxjs';
        const a$ = x$.pipe(map((x) => x));
      `,
    },
    {
      name: 'a local map shadowing the import',
      code: dedent`
        import { map } from 'synstate';
        const f = (map: (fn: (x: number) => number) => unknown) =>
          x$.pipe(map((x) => x));
      `,
    },
    {
      name: '`skipIfNoChange()` itself',
      code: dedent`
        import { skipIfNoChange } from 'synstate';
        const a$ = x$.pipe(skipIfNoChange());
      `,
    },
  ],

  invalid: [
    {
      name: 'an arrow returning its parameter',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map((x) => x));
      `,
      errors: [{ messageId: 'identityMap' }],
      output: dedent`
        import { skipIfNoChange } from 'synstate';
        import { map } from 'synstate';
        const a$ = x$.pipe(skipIfNoChange());
      `,
    },
    {
      name: 'a block returning its parameter, and a function expression',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const a$ = x$.pipe(
          map((x) => {
            return x;
          }),
        );
        const b$ = x$.pipe(
          map(function (x) {
            return x;
          }),
        );
      `,
      errors: [{ messageId: 'identityMap' }, { messageId: 'identityMap' }],
      output: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const a$ = x$.pipe(
          skipIfNoChange(),
        );
        const b$ = x$.pipe(
          skipIfNoChange(),
        );
      `,
    },
    {
      name: '`skipIfNoChange` under an alias',
      code: dedent`
        import { map, skipIfNoChange as dedupe } from 'synstate';
        const a$ = x$.pipe(map((x) => x));
      `,
      errors: [{ messageId: 'identityMap' }],
      output: dedent`
        import { map, skipIfNoChange as dedupe } from 'synstate';
        const a$ = x$.pipe(dedupe());
      `,
    },
    {
      name: 'a namespace import',
      code: dedent`
        import * as S from 'synstate';
        const a$ = x$.pipe(S.map((x) => x));
      `,
      errors: [{ messageId: 'identityMap' }],
      output: dedent`
        import * as S from 'synstate';
        const a$ = x$.pipe(S.skipIfNoChange());
      `,
    },
    {
      name: '`map` under an alias',
      code: dedent`
        import { map as project, skipIfNoChange } from 'synstate';
        const a$ = x$.pipe(project((x) => x));
      `,
      errors: [{ messageId: 'identityMap' }],
      output: dedent`
        import { map as project, skipIfNoChange } from 'synstate';
        const a$ = x$.pipe(skipIfNoChange());
      `,
    },
    {
      name: 'the import is added once for several reports',
      code: dedent`
        import { map } from 'synstate';
        const a$ = x$.pipe(map((x) => x));
        const b$ = y$.pipe(map((y) => y));
      `,
      errors: [{ messageId: 'identityMap' }, { messageId: 'identityMap' }],
      output: dedent`
        import { skipIfNoChange } from 'synstate';
        import { map } from 'synstate';
        const a$ = x$.pipe(skipIfNoChange());
        const b$ = y$.pipe(skipIfNoChange());
      `,
    },
    {
      name: 'a local `skipIfNoChange` that is not synstate’s: reported, not fixed',
      code: dedent`
        import { map } from 'synstate';
        const skipIfNoChange = 1;
        const a$ = x$.pipe(map((x) => x));
      `,
      errors: [{ messageId: 'identityMap' }],
      output: null,
    },
    {
      name: 'a comment in the function: reported, not fixed',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const a$ = x$.pipe(map((x) => x /* keep */));
      `,
      errors: [{ messageId: 'identityMap' }],
      output: null,
    },
    {
      name: 'outside a pipe',
      code: dedent`
        import { map, skipIfNoChange } from 'synstate';
        const same = map((x: number) => x);
      `,
      errors: [{ messageId: 'identityMap' }],
      output: null,
    },
  ],
});

describe('no-identity-map through type wrappers', () => {
  ruleTester.run('no-identity-map', noIdentityMap, {
    valid: [],
    invalid: [
      {
        name: 'a body in `as`, which changes the type: reported, not fixed',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(map((x) => x as number | string));
        `,
        errors: [{ messageId: 'identityMap' }],
        output: null,
      },
      {
        name: 'a body in `satisfies`, `!` and parentheses: reported, not fixed',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(map((x) => x satisfies number));
          const b$ = x$.pipe(map((x) => x!));
          const c$ = x$.pipe(map((x) => (x)));
        `,
        errors: [
          { messageId: 'identityMap' },
          { messageId: 'identityMap' },
          { messageId: 'identityMap' },
        ],
        output: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(map((x) => x satisfies number));
          const b$ = x$.pipe(map((x) => x!));
          const c$ = x$.pipe(skipIfNoChange());
        `,
      },
      {
        name: 'the function in `as`: reported, not fixed',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(map(((x) => x) as (x: number) => number | string));
        `,
        errors: [{ messageId: 'identityMap' }],
        output: null,
      },
      {
        name: 'a parameter or a return type annotated: reported, not fixed',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(map((x: number | string) => x));
          const b$ = x$.pipe(map((x): number | string => x));
          const c$ = x$.pipe(map<number, number | string>((x) => x));
        `,
        errors: [
          { messageId: 'identityMap' },
          { messageId: 'identityMap' },
          { messageId: 'identityMap' },
        ],
        output: null,
      },
      {
        name: 'a callee in `as`: reported, not fixed',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe((map as typeof map)((x) => x));
        `,
        errors: [{ messageId: 'identityMap' }],
        output: null,
      },
      {
        name: 'the call in `satisfies`, the wrapper kept',
        code: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(map((x) => x) satisfies unknown);
        `,
        errors: [{ messageId: 'identityMap' }],
        output: dedent`
          import { map, skipIfNoChange } from 'synstate';
          const a$ = x$.pipe(skipIfNoChange() satisfies unknown);
        `,
      },
    ],
  });
});
