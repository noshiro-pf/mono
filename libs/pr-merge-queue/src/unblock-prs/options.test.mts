import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { defaultOptions } from './options.mjs';

describe('README.md', () => {
  // Both option tables, the Japanese and the English, state every default.
  test('states the defaults `defaultOptions` has', async () => {
    const readme = await fs.readFile(
      path.join(import.meta.dirname, 'README.md'),
      'utf8',
    );

    const stated = Array.from(
      readme.matchAll(/^\| `--([a-z-]+) <[a-z]+>` *\| *(\d+) *\|/gmu),
      ([, flag, value]) => [flag, Number(value)] as const,
    );

    const expected = [
      ['active-interval', defaultOptions.activeIntervalSec],
      ['idle-after', defaultOptions.idleAfter],
      ['idle-interval', defaultOptions.idleIntervalSec],
      ['poll-interval', defaultOptions.pollIntervalSec],
      ['watch-timeout', defaultOptions.watchTimeoutMin],
    ] as const;

    assert.deepStrictEqual(stated, [...expected, ...expected]);
  });
});
