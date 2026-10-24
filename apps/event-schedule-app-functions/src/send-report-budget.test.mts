import { createMailBudget } from './send-report-budget.mjs';

const hour = 60 ** 2 * 1000;

describe(createMailBudget, () => {
  test('allows up to the limit within one window', () => {
    const tryConsume = createMailBudget({ limit: 3, windowMilliseconds: hour });

    assert.deepStrictEqual(
      [0, 1, 2, 3, 4].map((i) => tryConsume(i * 1000)),
      [true, true, true, false, false],
    );
  });

  test('allows again once the earliest send leaves the window', () => {
    const tryConsume = createMailBudget({ limit: 2, windowMilliseconds: hour });

    assert.isTrue(tryConsume(0));

    assert.isTrue(tryConsume(10));

    assert.isFalse(tryConsume(hour - 1));

    assert.isTrue(tryConsume(hour));

    assert.isFalse(tryConsume(hour + 1));

    assert.isTrue(tryConsume(hour + 10));
  });

  test('a refused call does not use up the budget', () => {
    const tryConsume = createMailBudget({ limit: 1, windowMilliseconds: hour });

    assert.isTrue(tryConsume(0));

    assert.isFalse(tryConsume(hour / 2));

    assert.isTrue(tryConsume(hour));
  });
});
