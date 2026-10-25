import {
  ageAt,
  findLatestStarted,
  formatYearMonth,
  isBirthdayMonth,
  monthOf,
  parseYearMonth,
  yearOf,
} from './year-month.mjs';

describe(parseYearMonth, () => {
  test('YYYY-MM を通算月数にすること', () => {
    assert.strictEqual(parseYearMonth('2026-01'), 2026 * 12);

    assert.strictEqual(parseYearMonth('2026-12'), 2026 * 12 + 11);
  });

  test('読めない値は undefined を返すこと', () => {
    assert.isUndefined(parseYearMonth(''));

    assert.isUndefined(parseYearMonth('2026-13'));

    assert.isUndefined(parseYearMonth('2026/01'));
  });

  test('formatYearMonth と往復すること', () => {
    assert.strictEqual(
      formatYearMonth(parseYearMonth('1990-04') ?? 0),
      '1990-04',
    );
  });
});

describe(ageAt, () => {
  const birth = parseYearMonth('1990-04') ?? 0;

  test('誕生月に年齢が上がること', () => {
    assert.strictEqual(ageAt(parseYearMonth('2026-03') ?? 0, birth), 35);

    assert.strictEqual(ageAt(parseYearMonth('2026-04') ?? 0, birth), 36);

    assert.isTrue(isBirthdayMonth(parseYearMonth('2026-04') ?? 0, birth));

    assert.isFalse(isBirthdayMonth(parseYearMonth('2026-05') ?? 0, birth));
  });

  test('年と月を取り出せること', () => {
    const m = parseYearMonth('2030-07') ?? 0;

    assert.strictEqual(yearOf(m), 2030);

    assert.strictEqual(monthOf(m), 7);
  });
});

describe(findLatestStarted, () => {
  const entries = [
    { start: 10, value: 'a' },
    { start: 20, value: 'b' },
  ] as const;

  test('開始月が過ぎた最後の要素を返すこと', () => {
    assert.isUndefined(findLatestStarted(entries, 9));

    assert.strictEqual(findLatestStarted(entries, 10)?.value, 'a');

    assert.strictEqual(findLatestStarted(entries, 19)?.value, 'a');

    assert.strictEqual(findLatestStarted(entries, 25)?.value, 'b');
  });
});
