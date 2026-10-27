import { DAY_MS, HOUR_MS } from './format.mjs';
import { lagFromParts, lagToParts } from './lag.mjs';

describe(lagToParts, () => {
  test('splits a lag into whole days and the hours left', () => {
    assert.deepStrictEqual(lagToParts(3 * DAY_MS + 5 * HOUR_MS), {
      days: 3,
      hours: 5,
    });

    assert.deepStrictEqual(lagToParts(0), { days: 0, hours: 0 });

    assert.deepStrictEqual(lagToParts(HOUR_MS / 2), { days: 0, hours: 0.5 });
  });

  test('keeps the sign of a lead on both parts', () => {
    assert.deepStrictEqual(lagToParts(-(DAY_MS + 2 * HOUR_MS)), {
      days: -1,
      hours: -2,
    });
  });
});

describe(lagFromParts, () => {
  test('adds the parts up', () => {
    assert.strictEqual(lagFromParts(2, 3), 2 * DAY_MS + 3 * HOUR_MS);

    assert.strictEqual(lagFromParts(0, 1.5), 1.5 * HOUR_MS);

    assert.strictEqual(lagFromParts(-1, 0), -DAY_MS);
  });

  test('round-trips with lagToParts', () => {
    for (const lag of [0, DAY_MS, 3 * DAY_MS + 4 * HOUR_MS, -5 * HOUR_MS]) {
      const { days, hours } = lagToParts(lag);

      assert.strictEqual(lagFromParts(days, hours), lag);
    }
  });
});
