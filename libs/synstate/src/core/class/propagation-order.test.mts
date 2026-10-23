import { createState } from '../../utils/index.mjs';
import { combine } from '../combine/index.mjs';
import { map } from '../operators/index.mjs';

describe('the nodes an update visits', () => {
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
