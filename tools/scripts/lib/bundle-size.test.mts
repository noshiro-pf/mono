import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  compressedSizesOf,
  formatKb,
  installedVersionOf,
  mapInSequence,
  tenthsOfKb,
} from './bundle-size.mjs';

describe('formatKb', () => {
  test('prints kB of 1,000 bytes to one decimal, an exact half rounded up', () => {
    assert.strictEqual(formatKb(18_149), '18.1');

    // `(18.15).toFixed(1)` is "18.1": the binary fraction is just below.
    assert.strictEqual(formatKb(18_150), '18.2');

    assert.strictEqual(formatKb(11_950), '12.0');

    assert.strictEqual(tenthsOfKb(11_950), 120);
  });
});

describe('compressedSizesOf', () => {
  test('measures the UTF-8 bytes, and compresses a repetitive text below them', () => {
    const code = 'é'.repeat(1000);

    const sizes = compressedSizesOf(code);

    assert.strictEqual(sizes.minified, 2000);

    assert.isTrue(sizes.gzip < sizes.minified);

    assert.isTrue(sizes.brotli < sizes.minified);
  });
});

describe('mapInSequence', () => {
  test('runs one call at a time, in order', async () => {
    const mut_log: string[] = [];

    const results = await mapInSequence([1, 2, 3], async (n) => {
      mut_log.push(`start ${n.toString()}`);

      await Promise.resolve();

      mut_log.push(`end ${n.toString()}`);

      return n * 10;
    });

    assert.deepStrictEqual(results, [10, 20, 30]);

    assert.deepStrictEqual(mut_log, [
      'start 1',
      'end 1',
      'start 2',
      'end 2',
      'start 3',
      'end 3',
    ]);
  });
});

describe('installedVersionOf', () => {
  test('reads the first manifest that exists and names the package', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bundle-size-'));

    try {
      const other = path.join(dir, 'other.json');

      const own = path.join(dir, 'own.json');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file in the test's own temporary directory
      await fs.writeFile(
        other,
        JSON.stringify({ name: 'b', version: '1.0.0' }),
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file in the test's own temporary directory
      await fs.writeFile(own, JSON.stringify({ name: 'a', version: '2.3.4' }));

      assert.strictEqual(
        await installedVersionOf('a', [
          path.join(dir, 'missing.json'),
          other,
          own,
        ]),
        '2.3.4',
      );

      await expect(installedVersionOf('c', [other, own])).rejects.toThrow(
        'cannot find the version of c',
      );
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
