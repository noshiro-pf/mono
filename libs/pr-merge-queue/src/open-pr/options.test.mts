import { Result } from 'ts-data-forge';
import { parseOptions, type Options } from './options.mjs';

const parsed = (...args: readonly string[]): ReturnType<typeof parseOptions> =>
  parseOptions(args);

/** Every field, so that a new one cannot be added without a decision here. */
const defaults: Options = {
  title: undefined,
  bodyFile: undefined,
  base: undefined,
  mergeAfter: [],
  mergeBefore: [],
  dryRun: false,
} as const;

describe(parseOptions, () => {
  test('defaults to acting, on no declared predecessor', () => {
    assert.deepStrictEqual(Result.unwrapOk(parsed()), defaults);
  });

  // `pnpm run open-pr -- --dry-run` forwards the `--` as well.
  test('drops the separator pnpm forwards', () => {
    assert.deepStrictEqual(Result.unwrapOk(parsed('--', '--dry-run')), {
      ...defaults,
      dryRun: true,
    });
  });

  test('reads a title and a body file', () => {
    assert.deepStrictEqual(
      Result.unwrapOk(
        parsed('--title', 'fix: a thing', '--body-file', './b.md'),
      ),
      { ...defaults, title: 'fix: a thing', bodyFile: './b.md' },
    );
  });

  test('reads the base branch', () => {
    assert.deepStrictEqual(Result.unwrapOk(parsed('--base', 'release')), {
      ...defaults,
      base: 'release',
    });
  });

  test('accepts `--merge-after` once per predecessor, with or without a `#`', () => {
    assert.deepStrictEqual(
      Result.unwrapOk(
        parsed('--merge-after', '#1901', '--merge-after', '1903'),
      ),
      { ...defaults, mergeAfter: [1901, 1903] },
    );
  });

  test('refuses a `--merge-after` that is not a pull request number', () => {
    assert.isTrue(Result.isErr(parsed('--merge-after', 'later')));
  });

  test('accepts `--merge-before` once per successor, with or without a `#`', () => {
    assert.deepStrictEqual(
      Result.unwrapOk(
        parsed('--merge-before', '#1905', '--merge-before', '1907'),
      ),
      { ...defaults, mergeBefore: [1905, 1907] },
    );
  });

  test('refuses a `--merge-before` that is not a pull request number', () => {
    assert.isTrue(Result.isErr(parsed('--merge-before', 'soon')));
  });

  // Both at once is a cycle of two, which nothing would ever merge.
  test('refuses a pull request named as both predecessor and successor', () => {
    assert.isTrue(
      Result.isErr(parsed('--merge-after', '1905', '--merge-before', '#1905')),
    );
  });

  // `unblock-prs` passes a draft over, so the option that would ask for one is
  // not quietly ignored.
  test('refuses an unknown option rather than ignoring it', () => {
    assert.isTrue(Result.isErr(parsed('--draft')));
  });

  test('asks for help', () => {
    assert.strictEqual(Result.unwrapOk(parsed('--help')), 'help');
  });
});
