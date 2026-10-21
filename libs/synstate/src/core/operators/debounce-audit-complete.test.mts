import { source } from '../create/index.mjs';
import type {
  KeepInitialValueOperator,
  Observable,
  SourceObservable,
} from '../types/index.mjs';
import { audit } from './audit.mjs';
import { debounce } from './debounce.mjs';

const operators: readonly (readonly [
  string,
  (milliSeconds: number) => KeepInitialValueOperator<number, number>,
])[] = [
  ['debounce', debounce],
  ['audit', audit],
] as const;

describe.each(operators)('%s', (_name, operator) => {
  const setup = (): Readonly<{
    source$: SourceObservable<number>;
    operated$: Observable<number>;
    history: readonly string[];
  }> => {
    const source$ = source<number>();

    const operated$ = source$.pipe(operator(100));

    const mut_history: string[] = [];

    operated$.subscribe(
      (v) => {
        mut_history.push(`next ${v}`);
      },
      () => {
        mut_history.push('complete');
      },
    );

    return { source$, operated$, history: mut_history };
  };

  test('passes on the pending value, then completes, when the source completes within the window', () => {
    vi.useFakeTimers();

    const { source$, operated$, history } = setup();

    source$.next(1);

    source$.next(2);

    source$.complete();

    assert.deepStrictEqual(history, ['next 2', 'complete']);

    assert.isTrue(operated$.isCompleted);

    vi.runAllTimers();

    assert.deepStrictEqual(history, ['next 2', 'complete']);

    vi.useRealTimers();
  });

  test('passes on the pending value, then completes, when it is completed itself', () => {
    vi.useFakeTimers();

    const { source$, operated$, history } = setup();

    source$.next(1);

    operated$.complete();

    assert.deepStrictEqual(history, ['next 1', 'complete']);

    vi.runAllTimers();

    assert.deepStrictEqual(history, ['next 1', 'complete']);

    vi.useRealTimers();
  });

  test('completes without emitting when nothing is pending', () => {
    vi.useFakeTimers();

    const { source$, operated$, history } = setup();

    source$.next(1);

    vi.runAllTimers();

    assert.deepStrictEqual(history, ['next 1']);

    operated$.complete();

    assert.deepStrictEqual(history, ['next 1', 'complete']);

    vi.useRealTimers();
  });

  test('drops the pending value when it is disposed', () => {
    vi.useFakeTimers();

    const { source$, operated$, history } = setup();

    source$.next(1);

    operated$.dispose();

    assert.deepStrictEqual(history, ['complete']);

    assert.isTrue(operated$.isCompleted);

    vi.runAllTimers();

    assert.deepStrictEqual(history, ['complete']);

    assert.isFalse(source$.isCompleted);

    vi.useRealTimers();
  });
});
