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
      name: 'a write passed to a call in pipe that is not a function argument',
      code: dedent`
        import { createState, map } from 'synstate';
        const [a$, setA] = createState(0);
        const b$ = a$.pipe(map(setA));
      `,
    },
  ],
  invalid: [
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
