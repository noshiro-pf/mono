import dedent from 'dedent';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  entryFilesOf,
  findMissingEntries,
  sinceOf,
  type Harness,
} from './check-strict-lib-lib-check-entries.mjs';

const plain = ['lib-check-entry.ts', 'lib-check-entry.intl-digits.ts'] as const;

const branded = [
  'lib-check-entry.branded.ts',
  'lib-check-entry.intl-digits.ts',
] as const;

const harness = (
  version: string,
  overrides: ReadonlyRecord<string, readonly string[]> = {},
  without: readonly string[] = [],
): Harness =>
  ({
    version,
    configs: new Map(
      Object.entries({
        'tsconfig.lib-check.json': plain,
        'tsconfig.lib-check.webworker.json': plain,
        'tsconfig.lib-files-check.branded.json': branded,
        ...overrides,
      }).filter(([config]) => !without.includes(config)),
    ),
  }) as const;

describe(findMissingEntries, () => {
  test('harnesses whose configs agree have no problem', () => {
    assert.deepStrictEqual(
      findMissingEntries([harness('5.0'), harness('7.0')]),
      [],
    );
  });

  test('a config that leaves out an entry the others name is reported with its harness', () => {
    const problems = findMissingEntries([
      harness('5.0'),
      harness('6.0', { 'tsconfig.lib-check.json': ['lib-check-entry.ts'] }),
      harness('7.0'),
    ]);

    assert.deepStrictEqual(problems, [
      {
        kind: 'missing-entry',
        version: '6.0',
        config: 'tsconfig.lib-check.json',
        entry: 'lib-check-entry.intl-digits.ts',
      },
    ]);
  });

  test('the two plain configs of a group name the same entries', () => {
    const problems = findMissingEntries([
      harness('5.0', {
        'tsconfig.lib-check.webworker.json': ['lib-check-entry.ts'],
      }),
    ]);

    assert.deepStrictEqual(problems, [
      {
        kind: 'missing-entry',
        version: '5.0',
        config: 'tsconfig.lib-check.webworker.json',
        entry: 'lib-check-entry.intl-digits.ts',
      },
    ]);
  });

  test('the branded group is its own: a plain entry is not asked of it', () => {
    const problems = findMissingEntries([
      harness('5.0', {
        'tsconfig.lib-check.json': Arr.toPushed(
          plain,
          'lib-check-entry.http-method.ts',
        ),
        'tsconfig.lib-check.webworker.json': Arr.toPushed(
          plain,
          'lib-check-entry.http-method.ts',
        ),
      }),
      harness('5.1', {
        'tsconfig.lib-check.json': Arr.toPushed(
          plain,
          'lib-check-entry.http-method.ts',
        ),
        'tsconfig.lib-check.webworker.json': Arr.toPushed(
          plain,
          'lib-check-entry.http-method.ts',
        ),
      }),
    ]);

    assert.deepStrictEqual(problems, []);
  });

  describe('an entry with a since-X.Y suffix', () => {
    const since = 'lib-check-entry.since-5.4.ts';

    const withSince = (version: string): Harness =>
      harness(version, {
        'tsconfig.lib-check.json': Arr.toPushed(plain, since),
        'tsconfig.lib-check.webworker.json': Arr.toPushed(plain, since),
      });

    test('is asked of the harnesses from that version on only', () => {
      assert.deepStrictEqual(
        findMissingEntries([
          harness('5.3'),
          withSince('5.4'),
          withSince('7.0'),
        ]),
        [],
      );
    });

    test('left out from that version on is reported', () => {
      assert.deepStrictEqual(
        findMissingEntries([harness('5.3'), withSince('5.4'), harness('5.10')]),
        [
          {
            kind: 'missing-entry',
            version: '5.10',
            config: 'tsconfig.lib-check.json',
            entry: since,
          },
          {
            kind: 'missing-entry',
            version: '5.10',
            config: 'tsconfig.lib-check.webworker.json',
            entry: since,
          },
        ],
      );
    });

    test('named before that version is reported', () => {
      assert.deepStrictEqual(
        findMissingEntries([
          harness('5.3', {
            'tsconfig.lib-check.json': Arr.toPushed(plain, since),
          }),
          withSince('5.4'),
        ]),
        [
          {
            kind: 'too-early',
            version: '5.3',
            config: 'tsconfig.lib-check.json',
            entry: since,
          },
        ],
      );
    });
  });

  test('a harness without one of the configs is reported', () => {
    assert.deepStrictEqual(
      findMissingEntries([
        harness('5.0'),
        harness('5.1', {}, ['tsconfig.lib-files-check.branded.json']),
      ]),
      [
        {
          kind: 'missing-config',
          version: '5.1',
          config: 'tsconfig.lib-files-check.branded.json',
        },
      ],
    );
  });
});

describe(sinceOf, () => {
  test.each([
    ['lib-check-entry.since-5.4.ts', '5.4'],
    ['lib-check-entry.branded.since-5.8.ts', '5.8'],
    ['lib-check-entry.since-10.12.ts', '10.12'],
  ] as const)('reads %s as from %s on', (entry, version) => {
    assert.strictEqual(sinceOf(entry), version);
  });

  test.each(['lib-check-entry.ts', 'lib-check-entry.intl-digits.ts'] as const)(
    '%s holds for every harness',
    (entry) => {
      assert.isUndefined(sinceOf(entry));
    },
  );
});

describe(entryFilesOf, () => {
  test('reads the entries of a config with comments, leaving other files out', () => {
    const text = dedent`
      {
        "extends": "../configs/tsconfig/tsconfig.lib-check.json",
        // A comment, as the harness configs have.
        "files": [
          "../configs/tsconfig/lib-check-entry.ts",
          "../configs/tsconfig/lib-check-entry.since-5.4.ts",
          "./other.ts"
        ]
      }
    `;

    const result = entryFilesOf(
      'strict-lib/v5.4/tsconfig.lib-check.json',
      text,
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [
      'lib-check-entry.ts',
      'lib-check-entry.since-5.4.ts',
    ]);
  });

  test('a config without `files` names no entry', () => {
    const result = entryFilesOf(
      'strict-lib/v5.0/tsconfig.lib-check.json',
      '{ "compilerOptions": {} }',
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, []);
  });
});
