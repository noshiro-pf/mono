import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  checkNextMajor,
  isBreakingRelease,
  listStockItems,
  parseChangesetBumps,
  type StockFile,
} from './check-next-major.mjs';

describe('parseChangesetBumps', () => {
  test('reads every quoting style the front matter is written in', () => {
    const bumps = parseChangesetBumps(dedent`
      ---
      'ts-data-forge': major
      "ts-fortress": minor
      synstate: patch
      ---

      Body: with a colon.
    `);

    assert.deepStrictEqual(
      bumps,
      new Map([
        ['ts-data-forge', 'major'],
        ['ts-fortress', 'minor'],
        ['synstate', 'patch'],
      ]),
    );
  });

  test('names nothing for a file without front matter', () => {
    assert.strictEqual(
      parseChangesetBumps('# Changesets\n\nfoo: major\n').size,
      0,
    );
  });
});

describe('listStockItems', () => {
  test('lists top-level items only, by their first line', () => {
    const items = listStockItems(dedent`
      # Next major

      - Rename \`foo\` to \`bar\`.

          Why it waits.

          - a nested list is part of the item

      1. Drop the default export.
    `);

    assert.deepStrictEqual(items, [
      { text: 'Rename `foo` to `bar`.', undecided: false },
      { text: 'Drop the default export.', undecided: false },
    ]);
  });

  test('marks the items under an Undecided heading, and only those', () => {
    const items = listStockItems(dedent`
      # Next major

      - decided

      ## Undecided

      - a candidate

      ## Later decisions

      - decided again
    `);

    assert.deepStrictEqual(items, [
      { text: 'decided', undecided: false },
      { text: 'a candidate', undecided: true },
      { text: 'decided again', undecided: false },
    ]);
  });

  test('reads the Undecided heading at any level and case', () => {
    const items = listStockItems('### UNDECIDED ###\n\n- a candidate\n');

    assert.deepStrictEqual(items, [{ text: 'a candidate', undecided: true }]);
  });

  test('ignores list items inside fenced code', () => {
    const items = listStockItems(
      [
        '# Next major',
        '',
        '```md',
        '- not an item',
        '```',
        '',
        '- an item',
      ].join('\n'),
    );

    assert.deepStrictEqual(items, [{ text: 'an item', undecided: false }]);
  });

  test('a shorter fence does not close a longer one', () => {
    const items = listStockItems(
      ['````', '```', '- still code', '````', '- an item'].join('\n'),
    );

    assert.deepStrictEqual(items, [{ text: 'an item', undecided: false }]);
  });
});

describe('isBreakingRelease', () => {
  test('is a release that raises the major', () => {
    assert.isTrue(isBreakingRelease('1.2.3', '2.0.0'));

    assert.isTrue(isBreakingRelease('0.5.1', '1.0.0'));
  });

  test('is a release that raises the minor of a 0.x package', () => {
    assert.isTrue(isBreakingRelease('0.5.1', '0.6.0'));
  });

  test('is not a minor or patch release of a 1.x package', () => {
    assert.isFalse(isBreakingRelease('1.2.3', '1.3.0'));

    assert.isFalse(isBreakingRelease('1.2.3', '1.2.4'));
  });

  test('is not a patch release of a 0.x package', () => {
    assert.isFalse(isBreakingRelease('0.5.1', '0.5.2'));
  });

  test('is not an unchanged or lowered version', () => {
    assert.isFalse(isBreakingRelease('1.2.3', '1.2.3'));

    assert.isFalse(isBreakingRelease('2.0.0', '1.2.3'));
  });

  test('is not a version it cannot read', () => {
    assert.isFalse(isBreakingRelease('1.2.3', 'next'));
  });
});

describe('checkNextMajor', () => {
  test('passes items while the version is unchanged', () => {
    const result = checkNextMajor({
      stocks: [stock('1.2.3')],
      baseVersions: new Map([['pkg', '1.2.3']]),
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ stocks: 1, decided: 1, undecided: 0 }),
    );
  });

  test('passes items a non-breaking release leaves behind', () => {
    const result = checkNextMajor({
      stocks: [stock('1.3.0')],
      baseVersions: new Map([['pkg', '1.2.3']]),
    });

    assert.isTrue(Result.isOk(result));
  });

  test('fails a major release that would leave items behind, and lists them', () => {
    const result = checkNextMajor({
      stocks: [stock('2.0.0')],
      baseVersions: new Map([['pkg', '1.2.3']]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'libs/pkg/NEXT_MAJOR.md: this tree releases pkg@2.0.0, a breaking\nrelease from 1.2.3.',
    );

    assert.include(result.value, '  - Rename `foo` to `bar`.');
  });

  test('fails on the decided items only, and leaves out the undecided', () => {
    const result = checkNextMajor({
      stocks: [
        stock(
          '2.0.0',
          dedent`
            # Next major

            - Rename \`foo\` to \`bar\`.

            ## Undecided

            - Drop the \`baz\` re-export.
          `,
        ),
      ],
      baseVersions: new Map([['pkg', '1.2.3']]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '  - Rename `foo` to `bar`.');

    assert.notInclude(result.value, 'baz');
  });

  test('lets a major release through undecided items', () => {
    const result = checkNextMajor({
      stocks: [stock('2.0.0', UNDECIDED_ONLY)],
      baseVersions: new Map([['pkg', '1.2.3']]),
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ stocks: 1, decided: 0, undecided: 1 }),
    );
  });

  test('fails a minor release of a 0.x package that would leave items behind', () => {
    const result = checkNextMajor({
      stocks: [stock('0.6.0')],
      baseVersions: new Map([['pkg', '0.5.1']]),
    });

    assert.isTrue(Result.isErr(result));
  });

  test('passes a package the base does not have', () => {
    const result = checkNextMajor({
      stocks: [stock('1.0.0')],
      baseVersions: new Map(),
    });

    assert.isTrue(Result.isOk(result));
  });

  test('fails a file with no items left', () => {
    const result = checkNextMajor({
      stocks: [stock('1.2.3', '# Next major\n')],
      baseVersions: new Map([['pkg', '1.2.3']]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'libs/pkg/NEXT_MAJOR.md: has no items left.');
  });

  test('fails a file with no package beside it', () => {
    const result = checkNextMajor({
      stocks: [{ ...stock('1.2.3'), manifest: undefined }],
      baseVersions: new Map(),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'no package.json naming a package');
  });
});

const stock = (
  version: string,
  content = '# Next major\n\n- Rename `foo` to `bar`.\n',
): StockFile =>
  ({
    file: 'libs/pkg/NEXT_MAJOR.md',
    content,
    manifest: { name: 'pkg', version },
  }) as const;

const UNDECIDED_ONLY = dedent`
  # Next major

  ## Undecided

  - Drop the \`baz\` re-export.
`;
