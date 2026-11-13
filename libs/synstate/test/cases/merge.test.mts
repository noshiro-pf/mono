import { Optional } from 'ts-data-forge';
import type { SafeUint } from 'ts-type-forge';
import {
  counter,
  createState,
  filter,
  map,
  merge,
  source,
  take,
  type Observable,
} from '../../src/index.mjs';
import { getStreamHistoryAsPromise } from '../get-stream-history-as-promise.mjs';
import { testStream } from '../test-stream.mjs';
import type { StreamTestCase } from '../typedef.mjs';

/*
  counter   0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17  18  19  20  21  22  23
  even      0       2       4       6       8       10      12      14      16      18      20      22
  odd          "1"     "3"     "5"     "7"     "9"     "11"    "13"    "15"    "17"    "19"    "21"    "23"
  merged    0  "1"  2  "3"  4  "5"  6  "7"  8  "9"  10 "11" 12 "13" 14 "15" 16 "17" 18 "19" 20 "21" 22 "23"
*/
const createStreams = (
  tick: number,
): Readonly<{
  startSource: () => void;
  counter$: Observable<SafeUint>;
  even$: Observable<number>;
  odd$: Observable<string>;
  merged$: Observable<number | string>;
}> => {
  const counter$ = counter(tick, { startManually: true });

  const counter6$ = counter$.pipe(take(6));

  const even$ = counter6$.pipe(filter((n) => n % 2 === 0));

  const odd$ = counter6$
    .pipe(filter((n) => n % 2 === 1))
    .pipe(map((a) => a.toString()));

  const merged$ = merge([even$, odd$] as const);

  return {
    startSource: () => {
      counter$.start();
    },
    counter$: counter6$,
    even$,
    odd$,
    merged$,
  };
};

export const mergeTestCases: readonly [StreamTestCase<number | string>] = [
  {
    name: 'merge case 1',
    expectedOutput: [0, '1', 2, '3', 4, '5'],
    run: (tick: number): Promise<readonly (number | string)[]> => {
      const { startSource, merged$ } = createStreams(tick);

      return getStreamHistoryAsPromise(merged$, startSource);
    },
    preview: (tick: number): void => {
      const { startSource, even$, odd$, merged$ } = createStreams(tick);

      even$.subscribe((a) => {
        console.log('even  ', a);
      });

      odd$.subscribe((a) => {
        console.log('odd   ', a);
      });

      merged$.subscribe((a) => {
        console.log('merged', a);
      });

      startSource();
    },
  },
] as const;

for (const c of mergeTestCases) {
  testStream(c);
}

describe('merge of an initialized source', () => {
  test('holds no value until a source emits', () => {
    const [state$, setState] = createState(1);

    const events$ = source<string>();

    const merged$ = merge([state$, events$]);

    assert.isTrue(Optional.isNone(merged$.getSnapshot()));

    const mut_history: (number | string)[] = [];

    merged$.subscribe((value) => {
      mut_history.push(value);
    });

    assert.deepStrictEqual(mut_history, []);

    events$.next('a');

    assert.deepStrictEqual(merged$.getSnapshot(), Optional.some('a'));

    setState(2);

    assert.deepStrictEqual(mut_history, ['a', 2]);
  });
});

// Each parent below is `n$` or derives from it, so a write to `n$` reaches, in
// one update, every parent that emits for it, and `merge` emits once per update.
describe('merge of parents that emit in the same update', () => {
  test('passes on the value of the first parent in the array', () => {
    const n$ = source<number>();

    const a$ = n$.pipe(map((x) => `a${x}`));

    const b$ = n$.pipe(map((x) => `b${x}`));

    const mut_history: string[] = [];

    merge([a$, b$]).subscribe((value) => {
      mut_history.push(value);
    });

    n$.next(1);

    n$.next(2);

    assert.deepStrictEqual(mut_history, ['a1', 'a2']);
  });

  test('takes the first parent by array order, not by creation order', () => {
    const n$ = source<number>();

    const a$ = n$.pipe(map((x) => `a${x}`));

    const b$ = n$.pipe(map((x) => `b${x}`));

    const mut_history: string[] = [];

    merge([b$, a$]).subscribe((value) => {
      mut_history.push(value);
    });

    n$.next(1);

    n$.next(2);

    assert.deepStrictEqual(mut_history, ['b1', 'b2']);
  });

  test('passes over a parent that does not emit in the update', () => {
    const n$ = source<number>();

    const a$ = n$.pipe(map((x) => `a${x}`));

    const even$ = n$
      .pipe(filter((x) => x % 2 === 0))
      .pipe(map((x) => `even${x}`));

    const mut_history: string[] = [];

    merge([even$, a$]).subscribe((value) => {
      mut_history.push(value);
    });

    n$.next(1);

    n$.next(2);

    assert.deepStrictEqual(mut_history, ['a1', 'even2']);
  });

  test('takes `n$` over a parent mapped from it when `n$` is first in the array', () => {
    const n$ = source<number>();

    const a$ = n$.pipe(map((x) => `a${x}`));

    const mut_history: (number | string)[] = [];

    merge([n$, a$]).subscribe((value) => {
      mut_history.push(value);
    });

    n$.next(1);

    n$.next(2);

    assert.deepStrictEqual(mut_history, [1, 2]);
  });

  test('takes a parent mapped from `n$` over `n$` when it is first in the array', () => {
    const n$ = source<number>();

    const a$ = n$.pipe(map((x) => `a${x}`));

    const mut_history: (number | string)[] = [];

    merge([a$, n$]).subscribe((value) => {
      mut_history.push(value);
    });

    n$.next(1);

    n$.next(2);

    assert.deepStrictEqual(mut_history, ['a1', 'a2']);
  });
});
