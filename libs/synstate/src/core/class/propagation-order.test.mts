import type { FixedLengthTuple } from 'ts-type-forge';
import { createState } from '../../utils/index.mjs';
import { combine } from '../combine/index.mjs';
import { map } from '../operators/index.mjs';

describe('the nodes an update visits', () => {
  test('a node an update nested in another reaches is still visited once by the outer one', () => {
    const [source$, setSource] = createState(0);

    const [other$, setOther] = createState(0);

    const a$ = source$.pipe(map((x) => x));

    const b$ = source$.pipe(map((x) => x));

    const c$ = combine([a$, b$, other$]);

    const mut_received: FixedLengthTuple<3, number>[] = [];

    c$.subscribe((v) => {
      mut_received.push(v);
    });

    // Runs after `a$` has queued `c$` for the outer update, and before `b$`
    // queues it again.
    b$.subscribe((x) => {
      if (x === 1) {
        setOther(1);
      }
    });

    setSource(1);

    assert.deepStrictEqual(mut_received, [
      [0, 0, 0],
      // the nested update
      [1, 1, 1],
      // the outer update
      [1, 1, 1],
    ]);
  });

  test('a node created during an update is visited by it if a parent emits after', () => {
    const [count$, setCount] = createState(0);

    const early$ = count$.pipe(map((x) => x));

    // Depth 2: emits after the subscribers of `early$` have run.
    const late$ = count$.pipe(map((x) => x)).pipe(map((x) => x));

    const mut_received: number[] = [];

    let mut_created = false;

    early$.subscribe((x) => {
      if (x !== 1 || mut_created) {
        return;
      }

      mut_created = true;

      // Starts from `late$`'s value before this update.
      late$.pipe(map((y) => y * 10)).subscribe((v) => {
        mut_received.push(v);
      });
    });

    setCount(1);

    assert.deepStrictEqual(mut_received, [0, 10]);
  });

  test('a node created while an update propagates is not visited by it', () => {
    const [count$, setCount] = createState(0);

    let mut_calls = 0;

    const countCall = (x: number): number => {
      mut_calls += 1;

      return x;
    };

    let mut_created = false;

    count$.subscribe((x) => {
      if (x !== 1 || mut_created) {
        return;
      }

      mut_created = true;

      count$.pipe(map(countCall)).subscribe(() => {});
    });

    count$.pipe(map((x) => x)).subscribe(() => {});

    setCount(1);

    // Once for the initial value; the update that created it does not run it
    // again.
    expect(mut_calls).toBe(1);

    setCount(2);

    expect(mut_calls).toBe(2);
  });

  test('a node of a new depth created while an update propagates is not visited by it', () => {
    const [count$, setCount] = createState(0);

    let mut_calls = 0;

    const countCall = (x: number): number => {
      mut_calls += 1;

      return x;
    };

    let mut_created = false;

    count$.subscribe((x) => {
      if (x !== 1 || mut_created) {
        return;
      }

      mut_created = true;

      // Depth 3: deeper than anything `count$` had, so the manager's array
      // grows while it is being walked.
      count$
        .pipe(map((y) => y))
        .pipe(map((y) => y))
        .pipe(map(countCall))
        .subscribe(() => {});
    });

    count$.pipe(map((x) => x)).subscribe(() => {});

    setCount(1);

    expect(mut_calls).toBe(1);

    setCount(2);

    expect(mut_calls).toBe(2);
  });

  test('a node completed while an update propagates is not visited by it', () => {
    const [count$, setCount] = createState(0);

    let mut_calls = 0;

    const late$ = count$.pipe(map((x) => x + 1)).pipe(
      map((x) => {
        mut_calls += 1;

        return x;
      }),
    );

    late$.subscribe(() => {});

    count$.subscribe((x) => {
      if (x === 1) {
        late$.complete();
      }
    });

    mut_calls = 0;

    setCount(1);

    expect(mut_calls).toBe(0);
  });

  test('a manager whose descendants skip depths updates them in order', () => {
    const [a$, setA] = createState(0);

    const [b$] = createState(10);

    // `c$` is at depth 3 and the only descendant of `a$`.
    const c$ = combine([a$, b$.pipe(map((x) => x)).pipe(map((x) => x))]);

    const d$ = c$.pipe(map(([x, y]) => x + y));

    const mut_values: number[] = [];

    d$.subscribe((v) => {
      mut_values.push(v);
    });

    setA(1);

    setA(2);

    assert.deepStrictEqual(mut_values, [10, 11, 12]);
  });
});
