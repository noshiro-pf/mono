import { Result } from 'ts-data-forge';
import { parseOptions } from './options.mjs';

const parsed = (...args: readonly string[]): ReturnType<typeof parseOptions> =>
  parseOptions(args);

describe(parseOptions, () => {
  test('answers help with no command', () => {
    assert.strictEqual(Result.unwrapOk(parsed()), 'help');

    assert.strictEqual(Result.unwrapOk(parsed('push', '1', '--help')), 'help');
  });

  // `pnpm run pr-description -- read 1` forwards the `--` as well.
  test('drops the separator pnpm forwards', () => {
    assert.deepStrictEqual(Result.unwrapOk(parsed('--', 'read', '#12')), {
      kind: 'read',
      number: 12,
      repo: undefined,
    });
  });

  test('reads pull and push', () => {
    assert.deepStrictEqual(
      Result.unwrapOk(parsed('pull', '12', '--file', 'd.md')),
      { kind: 'pull', number: 12, file: 'd.md', repo: undefined },
    );

    assert.deepStrictEqual(
      Result.unwrapOk(
        parsed(
          'push',
          '12',
          '--file',
          'd.md',
          '--wording-only',
          '--repo',
          'o/r',
        ),
      ),
      {
        kind: 'push',
        number: 12,
        file: 'd.md',
        wordingOnly: true,
        repo: 'o/r',
      },
    );
  });

  test('reads check and create', () => {
    assert.deepStrictEqual(Result.unwrapOk(parsed('check', '--file', 'd.md')), {
      kind: 'check',
      file: 'd.md',
    });

    assert.deepStrictEqual(
      Result.unwrapOk(
        parsed(
          'create',
          '--title',
          'fix: a thing',
          '--file',
          'd.md',
          '--label',
          'a',
          '--label',
          'b',
        ),
      ),
      {
        kind: 'create',
        title: 'fix: a thing',
        file: 'd.md',
        labels: ['a', 'b'],
        repo: undefined,
      },
    );
  });

  test.each([
    ['an unknown command', ['edit', '1']],
    ['a missing number', ['read']],
    ['a number that is not one', ['read', 'x']],
    ['pull without a file', ['pull', '1']],
    ['push without a file', ['push', '1']],
    ['read with a file', ['read', '1', '--file', 'd.md']],
    [
      'pull with --wording-only',
      ['pull', '1', '--file', 'd.md', '--wording-only'],
    ],
    ['check without a file', ['check']],
    ['create without a title', ['create', '--file', 'd.md']],
    ['an unknown flag', ['read', '1', '--force']],
  ] as const)('refuses %s', (_, args) => {
    assert.isTrue(Result.isErr(parsed(...args)));
  });
});
