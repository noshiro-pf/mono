import { counter } from './counter.mjs';

describe(counter, () => {
  test('completing before start() tears down without touching the timers', () => {
    const counter$ = counter(10, { startManually: true });

    counter$.complete();

    assert.isTrue(counter$.isCompleted);
  });
});
