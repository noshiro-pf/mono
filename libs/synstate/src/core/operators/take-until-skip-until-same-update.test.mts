import { combine } from '../combine/index.mjs';
import { source } from '../create/index.mjs';
import type { Observable } from '../types/index.mjs';
import { filter } from './filter.mjs';
import { map } from './map.mjs';
import { skipUntil } from './skip-until.mjs';
import { takeUntil } from './take-until.mjs';
import { takeWhile } from './take-while.mjs';

describe('a notifier that emits in the same update as the source', () => {
  type Branches = Readonly<{
    source$: Observable<number>;
    notifier$: Observable<unknown>;
  }>;

  // Each case derives a source and a notifier that fires on the source's value
  // 3 from `r$`. "Queued before / after the operator" is the order the update
  // would visit the notifier and an operator placed one step below the source,
  // were the two equally deep.
  const cases = [
    {
      notifier: 'one step below the source, queued before the operator',
      branches: (r$) => ({
        source$: r$,
        notifier$: r$.pipe(filter((x) => x >= 3)),
      }),
    },
    {
      notifier: 'two steps below the source',
      branches: (r$) => ({
        source$: r$,
        notifier$: r$.pipe(filter((x) => x >= 3)).pipe(map((x) => x)),
      }),
    },
    {
      // The operator is a child of `a$`, which `r$` reaches before `b$`.
      notifier: 'one step below the source, queued after the operator',
      branches: (r$) => {
        const a$ = r$.pipe(map((x) => x));

        const b$ = r$.pipe(map((x) => x));

        return { source$: a$, notifier$: b$.pipe(filter((x) => x >= 3)) };
      },
    },
    {
      // `deep$` makes the notifier deeper than its two steps below `r$`.
      notifier: 'two steps below the source, through a deeper second parent',
      branches: (r$) => {
        const deep$ = source(0)
          .pipe(map((x) => x))
          .pipe(map((x) => x));

        return {
          source$: r$,
          notifier$: combine([r$, deep$]).pipe(filter(([x]) => x >= 3)),
        };
      },
    },
  ] as const satisfies readonly Readonly<{
    notifier: string;
    branches: (r$: Observable<number>) => Branches;
  }>[];

  test.each(cases)(
    'takeUntil does not pass on that value (notifier $notifier)',
    ({ branches }) => {
      const r$ = source<number>();

      const { source$, notifier$ } = branches(r$);

      const taken$ = source$.pipe(takeUntil(notifier$));

      const mut_taken: number[] = [];

      taken$.subscribe((v) => {
        mut_taken.push(v);
      });

      for (const v of [1, 2, 3, 4]) {
        r$.next(v);
      }

      assert.deepStrictEqual(mut_taken, [1, 2]);

      assert.isTrue(taken$.isCompleted);
    },
  );

  test.each(cases)(
    'skipUntil passes on that value (notifier $notifier)',
    ({ branches }) => {
      const r$ = source<number>();

      const { source$, notifier$ } = branches(r$);

      const mut_passed: number[] = [];

      source$.pipe(skipUntil(notifier$)).subscribe((v) => {
        mut_passed.push(v);
      });

      for (const v of [1, 2, 3, 4]) {
        r$.next(v);
      }

      assert.deepStrictEqual(mut_passed, [3, 4]);
    },
  );
});

describe('a notifier that completes in the same update as the source emits', () => {
  // Completes without emitting on the source's value 3, through `takeWhile` two
  // steps below the source, so that it is deeper than an operator placed by the
  // source alone.
  const completingNotifier = (r$: Observable<number>): Observable<unknown> =>
    r$
      .pipe(map((x) => x))
      .pipe(takeWhile((x) => x < 3))
      .pipe(filter(() => false));

  test('takeUntil does not pass on that value', () => {
    const r$ = source<number>();

    const taken$ = r$.pipe(takeUntil(completingNotifier(r$)));

    const mut_taken: number[] = [];

    taken$.subscribe((v) => {
      mut_taken.push(v);
    });

    for (const v of [1, 2, 3, 4]) {
      r$.next(v);
    }

    assert.deepStrictEqual(mut_taken, [1, 2]);

    assert.isTrue(taken$.isCompleted);
  });

  test('skipUntil passes on that value', () => {
    const r$ = source<number>();

    const mut_passed: number[] = [];

    r$.pipe(skipUntil(completingNotifier(r$))).subscribe((v) => {
      mut_passed.push(v);
    });

    for (const v of [1, 2, 3, 4]) {
      r$.next(v);
    }

    assert.deepStrictEqual(mut_passed, [3, 4]);
  });
});
