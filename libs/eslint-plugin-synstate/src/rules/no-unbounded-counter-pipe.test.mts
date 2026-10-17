import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noUnboundedCounterPipe } from './no-unbounded-counter-pipe.mjs';

const ruleTester = new RuleTester();

ruleTester.run('no-unbounded-counter-pipe', noUnboundedCounterPipe, {
  valid: [
    {
      name: 'a counter that stops by itself after `times` emissions',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000, { times: 3 }).pipe(take(3));
      `,
    },
    {
      name: '`times` as a shorthand property',
      code: dedent`
        import { counter, take } from 'synstate';
        const times = 3;
        const tick$ = counter(1000, { times }).pipe(take(times));
      `,
    },
    {
      name: '`times` as a string key',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000, { 'times': 3 }).pipe(take(3));
      `,
    },
    {
      name: '`times` next to the other options',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000, { startManually: true, times: 3 }).pipe(take(3));
      `,
    },
    {
      name: 'options spread from elsewhere may carry `times`',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000, { ...options }).pipe(take(3));
      `,
    },
    {
      name: 'options with a computed key may carry `times`',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000, { [key]: 3 }).pipe(take(3));
      `,
    },
    {
      name: 'options passed as a variable may carry `times`',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000, options).pipe(take(3));
      `,
    },
    {
      name: 'arguments spread from elsewhere may carry `times`',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(...args).pipe(take(3));
      `,
    },
    {
      name: 'a named counter can be completed through its name',
      code: dedent`
        import { counter, take } from 'synstate';
        const counter$ = counter(1000);
        const tick$ = counter$.pipe(take(3));
      `,
    },
    {
      name: 'subscribing is not piping',
      code: dedent`
        import { counter } from 'synstate';
        const subscription = counter(1000).subscribe(() => {});
      `,
    },
    {
      name: 'a `counter` that is not synstate’s',
      code: dedent`
        import { counter } from 'other-lib';
        const tick$ = counter(1000).pipe(take(3));
      `,
    },
    {
      name: 'a `counter` declared in the file',
      code: dedent`
        const counter = (ms: number) => source(ms);
        const tick$ = counter(1000).pipe(take(3));
      `,
    },
    {
      name: 'a `counter` that shadows synstate’s',
      code: dedent`
        import { counter, take } from 'synstate';
        const f = (counter: (ms: number) => Source) => counter(1000).pipe(take(3));
      `,
    },
    {
      name: 'a namespace that shadows synstate’s',
      code: dedent`
        import * as S from 'synstate';
        const f = (S: Lib) => S.counter(1000).pipe(S.take(3));
      `,
    },
    {
      name: 'another export of synstate',
      code: dedent`
        import { timer, take } from 'synstate';
        const tick$ = timer(1000).pipe(take(1));
      `,
    },
  ],
  invalid: [
    {
      name: 'piping a counter with no options',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000).pipe(take(3));
      `,
      errors: [{ messageId: 'unboundedCounterPipe', line: 2, column: 15 }],
    },
    {
      name: 'piping a counter whose options have no `times`',
      code: dedent`
        import { counter, take } from 'synstate';
        const a$ = counter(1000, {}).pipe(take(3));
        const b$ = counter(1000, { startManually: true }).pipe(take(3));
        const c$ = counter(1000, { emitInitial: false }).pipe(take(3));
      `,
      errors: [
        { messageId: 'unboundedCounterPipe', line: 2 },
        { messageId: 'unboundedCounterPipe', line: 3 },
        { messageId: 'unboundedCounterPipe', line: 4 },
      ],
    },
    {
      name: 'piping a counter whose options are `undefined`',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000, undefined).pipe(take(3));
      `,
      errors: [{ messageId: 'unboundedCounterPipe' }],
    },
    {
      name: 'piping a counter imported under another name',
      code: dedent`
        import { counter as interval, take } from 'synstate';
        const tick$ = interval(1000).pipe(take(3));
      `,
      errors: [{ messageId: 'unboundedCounterPipe' }],
    },
    {
      name: 'piping a counter through a namespace import',
      code: dedent`
        import * as S from 'synstate';
        const tick$ = S.counter(1000).pipe(S.take(3));
      `,
      errors: [{ messageId: 'unboundedCounterPipe' }],
    },
    {
      name: 'piping a counter created inside another operator',
      code: dedent`
        import { counter, map, switchMap, take } from 'synstate';
        const opacity$ = rollDices$.pipe(
          switchMap(() =>
            counter(50)
              .pipe(take(11))
              .pipe(map((i) => (10 - i) / 10)),
          ),
        );
      `,
      errors: [{ messageId: 'unboundedCounterPipe', line: 4 }],
    },
    {
      name: 'an optional call of `pipe`',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000)?.pipe(take(3));
      `,
      errors: [{ messageId: 'unboundedCounterPipe' }],
    },
    {
      name: '`pipe` read with a computed string key',
      code: dedent`
        import { counter, take } from 'synstate';
        const tick$ = counter(1000)['pipe'](take(3));
      `,
      errors: [{ messageId: 'unboundedCounterPipe' }],
    },
    {
      name: 'the counter of each call in a file is judged on its own',
      code: dedent`
        import { counter, take } from 'synstate';
        const a$ = counter(1000, { times: 3 }).pipe(take(3));
        const b$ = counter(1000).pipe(take(3));
      `,
      errors: [{ messageId: 'unboundedCounterPipe', line: 3 }],
    },
  ],
});

describe('no-unbounded-counter-pipe through type wrappers', () => {
  ruleTester.run('no-unbounded-counter-pipe', noUnboundedCounterPipe, {
    valid: [
      {
        name: 'reads `times` through `as const`',
        code: dedent`
          import { counter, take } from 'synstate';
          const tick$ = counter(1000, { times: 3 } as const).pipe(take(3));
        `,
      },
    ],
    invalid: [
      {
        name: 'reads the counter through `as`',
        code: dedent`
          import { counter, take, type CounterObservable } from 'synstate';
          const tick$ = (counter(1000) as CounterObservable).pipe(take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
      {
        name: 'reads the counter through `satisfies`',
        code: dedent`
          import { counter, take, type CounterObservable } from 'synstate';
          const tick$ = (counter(1000) satisfies CounterObservable).pipe(take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
      {
        name: 'reads the counter through `!`',
        code: dedent`
          import { counter, take } from 'synstate';
          const tick$ = counter(1000)!.pipe(take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
      {
        name: 'reads the callee through `as`',
        code: dedent`
          import { counter, take } from 'synstate';
          const tick$ = (counter as typeof counter)(1000).pipe(take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
      {
        name: 'reads the namespace through `as`',
        code: dedent`
          import * as S from 'synstate';
          const tick$ = (S as typeof S).counter(1000).pipe(S.take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
      {
        name: 'reads options without `times` through `as const`',
        code: dedent`
          import { counter, take } from 'synstate';
          const tick$ = counter(1000, { emitInitial: false } as const).pipe(take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
    ],
  });
});

describe('no-unbounded-counter-pipe with parenthesized operands', () => {
  ruleTester.run('no-unbounded-counter-pipe', noUnboundedCounterPipe, {
    valid: [
      {
        name: 'reads `times` through parentheses',
        code: dedent`
          import { counter, take } from 'synstate';
          const tick$ = counter(1000, ({ times: 3 })).pipe(take(3));
        `,
      },
    ],
    invalid: [
      {
        name: 'reads a parenthesized counter',
        code: dedent`
          import { counter, take } from 'synstate';
          const tick$ = ((counter(1000))).pipe(take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
      {
        name: 'reads a parenthesized callee',
        code: dedent`
          import { counter, take } from 'synstate';
          const tick$ = (counter)(1000).pipe(take(3));
        `,
        errors: [{ messageId: 'unboundedCounterPipe' }],
      },
    ],
  });
});
