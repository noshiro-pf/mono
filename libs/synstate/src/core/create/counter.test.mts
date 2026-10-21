import { Arr } from 'ts-data-forge';
import { map } from '../operators/index.mjs';
import { counter } from './counter.mjs';

describe(counter, () => {
  test('completing before start() tears down without touching the timers', () => {
    const counter$ = counter(10, { startManually: true });

    counter$.complete();

    assert.isTrue(counter$.isCompleted);
  });

  test('emits 0 right after start(), then 1, 2, … every interval', () => {
    vi.useFakeTimers();

    const start = Date.now();

    const counter$ = counter(100);

    const mut_history: number[] = [];

    counter$.subscribe((n) => {
      mut_history.push(n);
    });

    vi.advanceTimersToNextTimer();

    assert.deepStrictEqual(mut_history, [0]);

    assert.strictEqual(vi.getMockedSystemTime()?.getTime(), start);

    vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

    assert.deepStrictEqual(mut_history, [0, 1, 2]);

    counter$.complete();

    vi.useRealTimers();
  });

  test('emitInitial: false skips the 0 and starts with 1 after one interval', () => {
    vi.useFakeTimers();

    const start = Date.now();

    const counter$ = counter(100, { emitInitial: false });

    const mut_history: number[] = [];

    counter$.subscribe((n) => {
      mut_history.push(n);
    });

    vi.advanceTimersToNextTimer();

    assert.deepStrictEqual(mut_history, [1]);

    assert.strictEqual(vi.getMockedSystemTime()?.getTime(), start + 100);

    vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

    assert.deepStrictEqual(mut_history, [1, 2, 3]);

    counter$.complete();

    vi.useRealTimers();
  });

  test('emitInitial: false still clears the interval on complete', () => {
    vi.useFakeTimers();

    const counter$ = counter(100, { emitInitial: false });

    const mut_history: number[] = [];

    counter$.subscribe((n) => {
      mut_history.push(n);
    });

    vi.advanceTimersToNextTimer();

    counter$.complete();

    assert.strictEqual(vi.getTimerCount(), 0);

    assert.deepStrictEqual(mut_history, [1]);

    vi.useRealTimers();
  });

  test.each([
    { emitInitial: true, expected: [0, 1, 2], firstAt: 0 },
    { emitInitial: false, expected: [1, 2, 3], firstAt: 100 },
  ] as const)(
    'startManually: false, emitInitial: $emitInitial starts at creation',
    ({ emitInitial, expected, firstAt }) => {
      vi.useFakeTimers();

      const start = Date.now();

      const counter$ = counter(100, { startManually: false, emitInitial });

      const mut_history: number[] = [];

      counter$.subscribe((n) => {
        mut_history.push(n);
      });

      vi.advanceTimersToNextTimer();

      assert.deepStrictEqual<readonly number[]>(
        mut_history,
        Arr.take(expected, 1),
      );

      assert.strictEqual(vi.getMockedSystemTime()?.getTime(), start + firstAt);

      vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

      assert.deepStrictEqual<readonly number[]>(mut_history, expected);

      counter$.complete();

      vi.useRealTimers();
    },
  );

  test.each([
    { emitInitial: true, expected: [0, 1, 2], firstAt: 0 },
    { emitInitial: false, expected: [1, 2, 3], firstAt: 100 },
  ] as const)(
    'startManually: true, emitInitial: $emitInitial waits for start()',
    ({ emitInitial, expected, firstAt }) => {
      vi.useFakeTimers();

      const counter$ = counter(100, { startManually: true, emitInitial });

      const mut_history: number[] = [];

      counter$.subscribe((n) => {
        mut_history.push(n);
      });

      assert.strictEqual(vi.getTimerCount(), 0);

      vi.setSystemTime(Date.now() + 1000);

      const start = Date.now();

      counter$.start();

      vi.advanceTimersToNextTimer();

      assert.deepStrictEqual<readonly number[]>(
        mut_history,
        Arr.take(expected, 1),
      );

      assert.strictEqual(vi.getMockedSystemTime()?.getTime(), start + firstAt);

      vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

      assert.deepStrictEqual<readonly number[]>(mut_history, expected);

      counter$.complete();

      assert.strictEqual(vi.getTimerCount(), 0);

      vi.useRealTimers();
    },
  );

  test('completing before the first emission cancels the pending 0', () => {
    vi.useFakeTimers();

    const counter$ = counter(100);

    const mut_history: number[] = [];

    counter$.subscribe((n) => {
      mut_history.push(n);
    });

    counter$.complete();

    assert.strictEqual(vi.getTimerCount(), 0);

    vi.runAllTimers();

    assert.deepStrictEqual(mut_history, []);

    vi.useRealTimers();
  });

  test.each([
    { emitInitial: true, expected: [0, 1, 2] },
    { emitInitial: false, expected: [1, 2, 3] },
  ] as const)(
    'times: 3, emitInitial: $emitInitial completes right after the third emission',
    ({ emitInitial, expected }) => {
      vi.useFakeTimers();

      const counter$ = counter(100, { times: 3, emitInitial });

      const mut_history: number[] = [];

      counter$.subscribe((n) => {
        mut_history.push(n);
      });

      vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

      assert.deepStrictEqual<readonly number[]>(
        mut_history,
        Arr.take(expected, 2),
      );

      assert.isFalse(counter$.isCompleted);

      vi.advanceTimersToNextTimer();

      assert.deepStrictEqual<readonly number[]>(mut_history, expected);

      assert.isTrue(counter$.isCompleted);

      assert.strictEqual(vi.getTimerCount(), 0);

      vi.useRealTimers();
    },
  );

  test('times: 1 emits only the 0 and clears the interval', () => {
    vi.useFakeTimers();

    const counter$ = counter(100, { times: 1 });

    const mut_history: number[] = [];

    counter$.subscribe((n) => {
      mut_history.push(n);
    });

    vi.advanceTimersToNextTimer();

    assert.deepStrictEqual(mut_history, [0]);

    assert.isTrue(counter$.isCompleted);

    assert.strictEqual(vi.getTimerCount(), 0);

    vi.useRealTimers();
  });

  test('times completes the downstream after the last value reaches it', () => {
    vi.useFakeTimers();

    const counter$ = counter(100, { times: 2 });

    const doubled$ = counter$.pipe(map((n) => n * 2));

    const mut_history: number[] = [];

    doubled$.subscribe((n) => {
      mut_history.push(n);
    });

    vi.advanceTimersToNextTimer().advanceTimersToNextTimer();

    assert.deepStrictEqual(mut_history, [0, 2]);

    assert.isTrue(doubled$.isCompleted);

    vi.useRealTimers();
  });
});
