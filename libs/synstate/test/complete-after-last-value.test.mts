import { Arr } from 'ts-data-forge';
import { map, source, take, zip, type Observable } from '../src/index.mjs';

/**
 * Each operator that completes itself in the same update as its last value,
 * with a `map` piped off it: what is derived from the operator sees that value
 * before the completion (#2371, #2768). A new such operator gets a case here.
 */
describe('an operator that completes on its last value passes it to what is derived from it first', () => {
  const cases: readonly Readonly<{
    name: string;
    build: () => Readonly<{ completing$: Observable<string>; run: () => void }>;
    last: string;
  }>[] = [
    {
      name: 'take',
      build: () => {
        const a = source<string>();

        return {
          completing$: a.pipe(take(2)),
          run: () => {
            a.next('p');

            a.next('q');
          },
        };
      },
      last: 'q',
    },
    {
      name: 'zip',
      build: () => {
        const a = source<number>();

        const b = source<string>();

        return {
          completing$: zip([a, b]).pipe(map(([n, s]) => `${n}${s}`)),
          run: () => {
            a.next(1);

            a.complete();

            b.next('x');
          },
        };
      },
      last: '1x',
    },
  ] as const;

  test.each(cases)('$name', ({ build, last }) => {
    const { completing$, run } = build();

    const derived$ = completing$.pipe(map((v) => `derived ${v}`));

    const mut_events: string[] = [];

    derived$.subscribe(
      (v) => {
        mut_events.push(v);
      },
      () => {
        mut_events.push('complete');
      },
    );

    run();

    assert.deepStrictEqual(Arr.takeLast(mut_events, 2), [
      `derived ${last}`,
      'complete',
    ]);
  });
});
