import { timer } from './timer.mjs';

describe(timer, () => {
  test('completing before start() tears down without touching the timer', () => {
    const timer$ = timer(10, { startManually: true });

    timer$.complete();

    assert.isTrue(timer$.isCompleted);
  });
});
