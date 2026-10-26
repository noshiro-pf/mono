// cspell:ignore unstub

import { logLine } from './log.mjs';

describe(logLine, () => {
  test('stamps the line with the local time and its offset from UTC', () => {
    assert.strictEqual(
      logLine('surveying', Date.parse('2026-09-27T12:03:04.500Z'), 9 * 60),
      '[2026-09-27T21:03:04.500+09:00] surveying',
    );
  });

  test('writes the offset of a zone west of UTC, and of UTC itself', () => {
    assert.strictEqual(
      logLine('surveying', Date.parse('2026-09-27T12:03:04Z'), -4 * 60),
      '[2026-09-27T08:03:04.000-04:00] surveying',
    );

    assert.strictEqual(
      logLine('surveying', Date.parse('2026-09-27T12:03:04Z'), 0),
      '[2026-09-27T12:03:04.000+00:00] surveying',
    );
  });

  describe('without a time given', () => {
    test.each([
      [
        'Asia/Tokyo',
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+09:00\] surveying$/u,
      ],
      [
        'UTC',
        /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+00:00\] surveying$/u,
      ],
    ] as const)('uses the machine time zone (TZ=%s)', (tz, expected) => {
      vi.stubEnv('TZ', tz);

      try {
        assert.match(logLine('surveying'), expected);
      } finally {
        vi.unstubAllEnvs();
      }
    });
  });
});
