import dedent from 'dedent';
import { findMissingChangesets } from './changesets.mjs';

describe('findMissingChangesets', () => {
  const released = [
    { name: 'ts-data-forge', dir: 'libs/ts-data-forge' },
    { name: 'split-view-extension', dir: 'apps/split-view-extension' },
  ] as const;

  test('names a released package whose src/ changed with no changeset', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: [
          'libs/ts-data-forge/src/array.mts',
          'apps/split-view-extension/src/app.tsx',
        ],
        released,
        changesets: [],
      }),
      ['split-view-extension', 'ts-data-forge'],
    );
  });

  test('a changeset that names the package covers it', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: [
          'libs/ts-data-forge/src/array.mts',
          '.changeset/brave-cats.md',
        ],
        released,
        changesets: [
          {
            file: '.changeset/brave-cats.md',
            content: dedent`
              ---
              'ts-data-forge': patch
              ---

              Fix it.
            `,
          },
        ],
      }),
      [],
    );
  });

  test('a changeset naming the package with `none` covers it', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: [
          'libs/ts-data-forge/src/array.mts',
          '.changeset/quiet-cats.md',
        ],
        released,
        changesets: [
          {
            file: '.changeset/quiet-cats.md',
            content:
              "---\n'ts-data-forge': none # internal only\n---\n\nRefactor.\n",
          },
        ],
      }),
      [],
    );
  });

  test('changes outside src/ and in other packages need none', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: [
          'libs/ts-data-forge/README.md',
          'libs/ts-data-forge/test/array.test.mts',
          'libs/ts-data-forge/src/array.test.mts',
          'apps/profile/src/index.mts',
        ],
        released,
        changesets: [],
      }),
      [],
    );
  });
});
