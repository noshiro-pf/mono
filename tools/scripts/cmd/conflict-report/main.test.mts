import { Result } from 'ts-data-forge';
import { generatedPatterns, parseOptions } from './main.mjs';

describe(parseOptions, () => {
  test('defaults to a week of main, as Markdown', () => {
    assert.deepStrictEqual(
      parseOptions([]),
      Result.ok({ days: 7, format: 'md', base: 'main' }),
    );
  });

  test('reads the window, the format and the base', () => {
    assert.deepStrictEqual(
      parseOptions(['--', '--days', '30', '--format', 'json', '--base', 'dev']),
      Result.ok({ days: 30, format: 'json', base: 'dev' }),
    );
  });

  test('refuses a format it does not write, and a window of no days', () => {
    assert.isTrue(Result.isErr(parseOptions(['--format', 'csv'])));

    assert.isTrue(Result.isErr(parseOptions(['--days', '0'])));
  });
});

describe(generatedPatterns, () => {
  test('reads the regenerate patterns of the configuration', () => {
    const patterns = generatedPatterns({
      regenerate: {
        before: [],
        generators: [{ path: String.raw`^docs/x\.md$`, run: 'gen' }],
      },
    });

    assert.strictEqual(patterns.length, 1);

    assert.isTrue(patterns[0]?.test('docs/x.md') === true);
  });

  test('is empty without the key', () => {
    assert.deepStrictEqual(generatedPatterns({ autoFix: {} }), []);

    assert.deepStrictEqual(generatedPatterns(undefined), []);
  });
});
