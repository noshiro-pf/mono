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
          '--priority',
          'B',
          '--label',
          'a',
          '--label',
          'b',
          '--not-duplicate',
          '#7',
          '--not-duplicate',
          '9',
        ),
      ),
      {
        kind: 'create',
        title: 'fix: a thing',
        file: 'd.md',
        priority: 'B',
        labels: ['a', 'b'],
        notDuplicates: [7, 9],
        repo: undefined,
      },
    );
  });

  test('reads similar', () => {
    assert.deepStrictEqual(
      Result.unwrapOk(
        parsed(
          'similar',
          '--title',
          'fix: a thing',
          '--keyword',
          'onUserDelete',
        ),
      ),
      {
        kind: 'similar',
        title: 'fix: a thing',
        keywords: ['onUserDelete'],
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
    ['create without a title', ['create', '--file', 'd.md', '--priority', 'B']],
    ['create without a priority', ['create', '--title', 'x', '--file', 'd.md']],
    [
      'create with a priority that is not a tier',
      ['create', '--title', 'x', '--file', 'd.md', '--priority', 'high'],
    ],
    [
      'create under close, which is a verdict on an issue',
      ['create', '--title', 'x', '--file', 'd.md', '--priority', 'close'],
    ],
    [
      'create with a priority label given as a label',
      [
        'create',
        '--title',
        'x',
        '--file',
        'd.md',
        '--priority',
        'B',
        '--label',
        'priority:S',
      ],
    ],
    [
      'create with a --not-duplicate that is not a number',
      [
        'create',
        '--title',
        'x',
        '--file',
        'd.md',
        '--priority',
        'B',
        '--not-duplicate',
        'x',
      ],
    ],
    ['similar without a title', ['similar', '--keyword', 'x']],
    ['an unknown flag', ['read', '1', '--force']],
  ] as const)('refuses %s', (_, args) => {
    assert.isTrue(Result.isErr(parsed(...args)));
  });
});
