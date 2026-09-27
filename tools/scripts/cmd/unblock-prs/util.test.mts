// cspell:ignore unstub

import { logLine } from './util.mjs';

describe(logLine, () => {
  test('stamps the line with the local time and its offset from UTC', () => {
    assert.strictEqual(
      logLine(
        'surveying',
        Temporal.ZonedDateTime.from('2026-09-27T21:03:04.5+09:00[Asia/Tokyo]'),
      ),
      '[2026-09-27T21:03:04.500+09:00] surveying',
    );
  });

  test('writes the offset of a zone west of UTC, and of UTC itself', () => {
    assert.strictEqual(
      logLine(
        'surveying',
        Temporal.ZonedDateTime.from(
          '2026-09-27T08:03:04-04:00[America/New_York]',
        ),
      ),
      '[2026-09-27T08:03:04.000-04:00] surveying',
    );

    assert.strictEqual(
      logLine(
        'surveying',
        Temporal.ZonedDateTime.from('2026-09-27T12:03:04+00:00[UTC]'),
      ),
      '[2026-09-27T12:03:04.000+00:00] surveying',
    );
  });

  describe('without a time given', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

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

      assert.match(logLine('surveying'), expected);
    });
  });
});
