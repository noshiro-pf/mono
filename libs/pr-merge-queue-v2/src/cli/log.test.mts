import { logLine } from './log.mjs';

describe(logLine, () => {
  test('stamps the local time with its offset', () => {
    const at = Date.parse('2026-09-27T12:03:04.500Z');

    assert.strictEqual(
      logLine('hello', at, 540),
      '[2026-09-27T21:03:04.500+09:00] hello',
    );

    assert.strictEqual(
      logLine('hello', at, -150),
      '[2026-09-27T09:33:04.500-02:30] hello',
    );
  });
});
