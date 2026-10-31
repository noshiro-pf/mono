import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noWriteDuringPropagation } from './no-write-during-propagation.mjs';

const ruleTester = new RuleTester();

ruleTester.run('no-write-during-propagation', noWriteDuringPropagation, {
  valid: [
    {
      name: 'a value derived with pipe',
      code: dedent`
        import { createState, map } from 'synstate';
        const [a$, setA] = createState(0);
        const b$ = a$.pipe(map((a) => a * 2));
        b$.subscribe((b) => { console.log(b); });
        setA(1);
      `,
    },
    {
      name: 'a write outside any subscriber',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const onClick = () => { setA(1); };
      `,
    },
    {
      name: 'a write in a function the subscriber defers',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        a$.subscribe((a) => {
          setTimeout(() => { setB(a); }, 0);
        });
      `,
    },
    {
      name: 'a read of the snapshot in a subscriber',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA, { getSnapshot }] = createState(0);
        a$.subscribe(() => { console.log(getSnapshot()); });
      `,
    },
    {
      name: 'a setter that is not synstate’s',
      code: dedent`
        import { createState } from 'other-state';
        const [a$, setA] = createState(0);
        a$.subscribe((a) => { setA(a + 1); });
      `,
    },
    {
      name: 'a local function shadowing the setter',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        a$.subscribe((a) => {
          const setA = (n: number) => n;
          setA(a);
        });
      `,
    },
    {
      name: 'the observable of a state, not its setter',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        a$.subscribe(() => { a$.getSnapshot(); });
      `,
    },
    {
      name: '`next` on something that is not a synstate source',
      code: dedent`
        import { createState } from 'synstate';
        const [a$] = createState(0);
        a$.subscribe(() => { iterator.next(); });
      `,
    },
    {
      name: 'an imported setter, without type information',
      code: dedent`
        import { setB } from './store.mjs';
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        a$.subscribe((a) => { setB(a); });
      `,
    },
    {
      name: 'a helper that does not write',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const log = (a: number) => { console.log(a); };
        a$.subscribe((a) => { log(a); });
      `,
    },
    {
      name: 'a helper that writes, called outside any subscriber',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const reset = () => { setA(0); };
        reset();
        a$.subscribe((a) => { console.log(a); });
      `,
    },
    {
      name: 'a helper that only defers its write',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        const later = (a: number) => { setTimeout(() => { setB(a); }, 0); };
        a$.subscribe(later);
      `,
    },
    {
      name: 'a subscriber bound with let, which may be reassigned',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        let onA = (a: number) => { setB(a); };
        a$.subscribe(onA);
      `,
    },
    {
      name: 'a recursive helper that does not write',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        function count(n: number): number { return n === 0 ? 0 : count(n - 1); }
        a$.subscribe((a) => { count(a); });
      `,
    },
    {
      name: 'a write passed to a call in pipe that is not a function argument',
      code: dedent`
        import { createState, map } from 'synstate';
        const [a$, setA] = createState(0);
        const b$ = a$.pipe(map(setA));
      `,
    },
    {
      name: 'a `useObservableEffect` that is not synstate’s',
      code: dedent`
        import { createState } from 'synstate';
        import { useObservableEffect } from 'other-hooks';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        const useSync = () => { useObservableEffect(a$, (a) => { setB(a); }); };
      `,
    },
    {
      name: 'a write deferred from a `useObservableEffect` callback',
      code: dedent`
        import { createState, useObservableEffect } from 'synstate-react-hooks';
        const [, setA, { state: a$ }] = createState(0);
        const [, setB] = createState(0);
        const useSync = () => {
          useObservableEffect(a$, (a) => { setTimeout(() => { setB(a); }, 0); });
        };
      `,
    },
  ],
  invalid: [
    {
      name: 'a setter from each wrapper package',
      code: dedent`
        import { createState } from 'synstate-react-hooks';
        import { createReducer } from 'synstate-react-hooks-compat';
        import { createBooleanState } from 'synstate-preact-hooks';
        import { source } from 'synstate-preact-signals';
        const [, setA, { state: a$ }] = createState(0);
        const [, dispatch] = createReducer((s: number, n: number) => s + n, 0);
        const [, { toggle }] = createBooleanState(false);
        const b$ = source<number>();
        a$.subscribe((a) => {
          setA(a + 1);
          dispatch(a);
          toggle();
          b$.next(a);
        });
      `,
      errors: [
        { messageId: 'writeDuringPropagation', line: 10 },
        { messageId: 'writeDuringPropagation', line: 11 },
        { messageId: 'writeDuringPropagation', line: 12 },
        { messageId: 'writeDuringPropagation', line: 13 },
      ],
    },
    {
      name: 'a write from a `useObservableEffect` callback',
      code: dedent`
        import { createState } from 'synstate';
        import { useObservableEffect } from 'synstate-preact-hooks';
        import * as hooks from 'synstate-react-hooks';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        const onA = (a: number) => { setB(a); };
        const useSync = () => {
          useObservableEffect(a$, (a) => { setB(a); });
          hooks.useObservableEffect(a$, onA);
        };
      `,
      errors: [
        { messageId: 'writeDuringPropagation', line: 6 },
        { messageId: 'writeDuringPropagation', line: 8 },
      ],
    },
    {
      name: 'setState from a subscriber',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        a$.subscribe((a) => { setB(a * 2); });
      `,
      errors: [{ messageId: 'writeDuringPropagation', line: 4 }],
    },
    {
      name: 'a write back into the state the subscriber listens to',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        a$.subscribe((a) => { setA(a + 1); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
    {
      name: 'a function expression as the subscriber',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        a$.subscribe(function (a) { setB(a); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
    {
      name: 'updateState and resetState of createState',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB, { updateState, resetState }] = createState(0);
        a$.subscribe((a) => {
          updateState((b) => b + a);
          resetState();
        });
      `,
      errors: [
        { messageId: 'writeDuringPropagation', line: 5 },
        { messageId: 'writeDuringPropagation', line: 6 },
      ],
    },
    {
      name: 'a renamed utility of createState',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB, { resetState: resetB }] = createState(0);
        a$.subscribe(() => { resetB(); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
    {
      name: 'dispatch of createReducer',
      code: dedent`
        import { createReducer, createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, dispatch] = createReducer((s: number, n: number) => s + n, 0);
        a$.subscribe((a) => { dispatch(a); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
    {
      name: 'the utilities of createBooleanState',
      code: dedent`
        import { createBooleanState, createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [open$, { setTrue, toggle: flip }] = createBooleanState(false);
        a$.subscribe(() => {
          setTrue();
          flip();
        });
      `,
      errors: [
        { messageId: 'writeDuringPropagation', line: 5 },
        { messageId: 'writeDuringPropagation', line: 6 },
      ],
    },
    {
      name: 'the emitter of createValueEmitter',
      code: dedent`
        import { createState, createValueEmitter } from 'synstate';
        const [a$, setA] = createState(0);
        const [message$, emitMessage] = createValueEmitter<string>();
        a$.subscribe((a) => { emitMessage(String(a)); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
    {
      name: '`next` of a source',
      code: dedent`
        import { createState, source } from 'synstate';
        const [a$, setA] = createState(0);
        const b$ = source<number>();
        a$.subscribe((a) => { b$.next(a); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
    {
      name: 'a write from a projection',
      code: dedent`
        import { createState, map } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        const c$ = a$.pipe(map((a) => {
          setB(a);
          return a * 2;
        }));
      `,
      errors: [{ messageId: 'writeDuringPropagation', line: 5 }],
    },
    {
      name: 'a subscriber passed by name',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        const onA = (a: number) => { setB(a); };
        a$.subscribe(onA);
      `,
      errors: [{ messageId: 'writeDuringPropagation', line: 4 }],
    },
    {
      name: 'a function declaration passed as a subscriber',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        function onA(a: number) { setB(a); }
        a$.subscribe(onA);
      `,
      errors: [{ messageId: 'writeDuringPropagation', line: 4 }],
    },
    {
      name: 'a projection passed by name',
      code: dedent`
        import { createState, map } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        const double = (a: number) => { setB(a); return a * 2; };
        const c$ = a$.pipe(map(double));
      `,
      errors: [{ messageId: 'writeDuringPropagation', line: 4 }],
    },
    {
      name: 'a helper that writes, reported where the subscriber calls it',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        const sync = (a: number) => { setB(a); };
        a$.subscribe((a) => { sync(a); });
      `,
      errors: [
        {
          messageId: 'writeThroughCall',
          data: { name: 'sync' },
          line: 5,
        },
      ],
    },
    {
      name: 'a write two helpers down, and helpers that call each other',
      code: dedent`
        import { createState } from 'synstate';
        const [a$, setA] = createState(0);
        const [b$, setB] = createState(0);
        function ping(n: number): void { if (n > 0) pong(n - 1); }
        function pong(n: number): void { ping(n); setB(n); }
        const outer = (a: number) => { ping(a); };
        a$.subscribe((a) => { outer(a); });
      `,
      errors: [
        {
          messageId: 'writeThroughCall',
          data: { name: 'outer' },
          line: 7,
        },
      ],
    },
    {
      name: 'an aliased import',
      code: dedent`
        import { createState as state } from 'synstate';
        const [a$, setA] = state(0);
        const [b$, setB] = state(0);
        a$.subscribe((a) => { setB(a); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
    {
      name: 'a namespace import',
      code: dedent`
        import * as s from 'synstate';
        const [a$, setA] = s.createState(0);
        const [b$, setB] = s.createState(0);
        a$.subscribe((a) => { setB(a); });
      `,
      errors: [{ messageId: 'writeDuringPropagation' }],
    },
  ],
});

describe('no-write-during-propagation through type wrappers', () => {
  ruleTester.run('no-write-during-propagation', noWriteDuringPropagation, {
    valid: [],
    invalid: [
      {
        name: 'the setter called through `as` and `!`',
        code: dedent`
          import { createState } from 'synstate';
          const [a$, setA] = createState(0);
          const [b$, setB] = createState(0);
          a$.subscribe((a) => {
            (setB as (n: number) => number)(a);
            setB!(a);
          });
        `,
        errors: [
          { messageId: 'writeDuringPropagation', line: 5 },
          { messageId: 'writeDuringPropagation', line: 6 },
        ],
      },
      {
        name: 'the factory call wrapped in `satisfies`',
        code: dedent`
          import { createState } from 'synstate';
          const [a$, setA] = createState(0);
          const [b$, setB] = createState(0) satisfies readonly unknown[];
          a$.subscribe((a) => { setB(a); });
        `,
        errors: [{ messageId: 'writeDuringPropagation' }],
      },
      {
        name: 'the subscriber wrapped in `satisfies`',
        code: dedent`
          import { createState } from 'synstate';
          const [a$, setA] = createState(0);
          const [b$, setB] = createState(0);
          a$.subscribe(((a: number) => { setB(a); }) satisfies (a: number) => void);
        `,
        errors: [{ messageId: 'writeDuringPropagation' }],
      },
      {
        name: 'a subscriber passed by name through `as`, and a helper through `!`',
        code: dedent`
          import { createState } from 'synstate';
          const [a$, setA] = createState(0);
          const [b$, setB] = createState(0);
          const sync = ((a: number) => { setB(a); }) satisfies (a: number) => void;
          const onA = (a: number) => { sync!(a); };
          a$.subscribe(onA as (a: number) => void);
        `,
        errors: [{ messageId: 'writeThroughCall', line: 5 }],
      },
      {
        name: 'the source wrapped in `as`',
        code: dedent`
          import { createState, source } from 'synstate';
          const [a$, setA] = createState(0);
          const b$ = source<number>();
          a$.subscribe((a) => { (b$ as typeof b$).next(a); });
        `,
        errors: [{ messageId: 'writeDuringPropagation' }],
      },
    ],
  });
});
