import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  checkNextMajor,
  listStockItems,
  parseChangesetBumps,
  type ChangesetFile,
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

describe('checkNextMajor', () => {
  test('passes items no breaking release is waiting on', () => {
    const result = checkNextMajor({
      changesets: [changeset('minor'), changeset('major', 'other')],
      stocks: [stock('1.2.3')],
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ stocks: 1, decided: 1, undecided: 0, reminders: [] }),
    );
  });

  test('fails a major bump that would leave items behind, and lists them', () => {
    const result = checkNextMajor({
      changesets: [changeset('patch'), changeset('major')],
      stocks: [stock('1.2.3')],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '.changeset/major.md releases\npkg@1.2.3');

    assert.include(result.value, '  - Rename `foo` to `bar`.');
  });

  test('lets a major bump through undecided items, and reminds of them', () => {
    const result = checkNextMajor({
      changesets: [changeset('major')],
      stocks: [stock('1.2.3', UNDECIDED_ONLY)],
    });

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(result.value.undecided, 1);

    assert.lengthOf(result.value.reminders, 1);

    assert.include(result.value.reminders[0], '  - Drop the `baz` re-export.');
  });

  test('reminds of nothing while no breaking release is pending', () => {
    const result = checkNextMajor({
      changesets: [changeset('minor')],
      stocks: [stock('1.2.3', UNDECIDED_ONLY)],
    });

    assert.deepStrictEqual(
      result,
      Result.ok({ stocks: 1, decided: 0, undecided: 1, reminders: [] }),
    );
  });

  test('fails on the decided items only, and lists the undecided apart', () => {
    const result = checkNextMajor({
      changesets: [changeset('major')],
      stocks: [
        stock(
          '1.2.3',
          dedent`
            # Next major

            - Rename \`foo\` to \`bar\`.

            ## Undecided

            - Drop the \`baz\` re-export.
          `,
        ),
      ],
    });

    assert.isTrue(Result.isErr(result));

    const [decided, undecided] = result.value.split('Undecided, and not', 2);

    assert.include(decided, '  - Rename `foo` to `bar`.');

    assert.notInclude(decided, 'baz');

    assert.include(undecided, '  - Drop the `baz` re-export.');
  });

  test('treats a minor bump of a 0.x package as breaking', () => {
    const result = checkNextMajor({
      changesets: [changeset('minor')],
      stocks: [stock('0.5.1')],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'breaking "minor" bump');
  });

  test('passes a patch bump of a 0.x package', () => {
    const result = checkNextMajor({
      changesets: [changeset('patch')],
      stocks: [stock('0.5.1')],
    });

    assert.isTrue(Result.isOk(result));
  });

  test('fails a file with no items left', () => {
    const result = checkNextMajor({
      changesets: [],
      stocks: [stock('1.2.3', '# Next major\n')],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'libs/pkg/NEXT_MAJOR.md: has no items left.');
  });

  test('fails a file with no package beside it', () => {
    const result = checkNextMajor({
      changesets: [],
      stocks: [{ ...stock('1.2.3'), manifest: undefined }],
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

const changeset = (bump: string, name = 'pkg'): ChangesetFile =>
  ({
    file: `.changeset/${bump}.md`,
    content: `---\n'${name}': ${bump}\n---\n\nSomething.\n`,
  }) as const;

const UNDECIDED_ONLY = dedent`
  # Next major

  ## Undecided

  - Drop the \`baz\` re-export.
`;
