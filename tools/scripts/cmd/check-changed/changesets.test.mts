import dedent from 'dedent';
import {
  bundledPrivatePackages,
  findMissingChangesets,
  type WorkspacePackage,
} from './changesets.mjs';

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

describe('findMissingChangesets, for what a released package bundles', () => {
  const released = [
    {
      name: 'split-view-extension',
      dir: 'apps/split-view-extension',
      bundles: [{ name: 'split-view-link', dir: 'apps/split-view-link' }],
    },
  ] as const;

  test('names the released package, through the private one that changed', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: ['apps/split-view-link/src/layout.mts'],
        released,
        changesets: [],
      }),
      ['split-view-extension (through split-view-link)'],
    );
  });

  test('a changeset naming the released package covers it', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: ['apps/split-view-link/src/layout.mts'],
        released,
        changesets: [
          {
            file: '.changeset/a.md',
            content: "---\n'split-view-extension': patch\n---\n\nFix it.\n",
          },
        ],
      }),
      [],
    );
  });

  test('a test of the private package ships nothing', () => {
    assert.deepStrictEqual(
      findMissingChangesets({
        changedFiles: ['apps/split-view-link/src/layout.test.mts'],
        released,
        changesets: [],
      }),
      [],
    );
  });
});

describe('bundledPrivatePackages', () => {
  test('reaches private packages through private ones, not through released ones', () => {
    const bundled = bundledPrivatePackages([
      pkg('extension', true, ['link', 'released-lib']),
      pkg('link', true, ['inner']),
      pkg('inner', true),
      pkg('released-lib', false, ['lib-private']),
      pkg('lib-private', true),
    ]);

    assert.deepStrictEqual(
      bundled
        .get('extension')
        ?.map(({ name }) => name)
        .toSorted(),
      ['inner', 'link'],
    );

    assert.deepStrictEqual(
      bundled.get('released-lib')?.map(({ name }) => name),
      ['lib-private'],
    );
  });

  test('reads a dependency cycle once', () => {
    const bundled = bundledPrivatePackages([
      pkg('a', true, ['b']),
      pkg('b', true, ['a']),
    ]);

    assert.deepStrictEqual(
      bundled
        .get('a')
        ?.map(({ name }) => name)
        .toSorted(),
      ['a', 'b'],
    );
  });
});

/** A workspace package for `bundledPrivatePackages`, under `apps/`. */
const pkg = (
  name: string,
  isPrivate: boolean,
  dependencies: readonly string[] = [],
): WorkspacePackage =>
  ({
    name,
    dir: `apps/${name}`,
    isPrivate,
    buildDependencies: new Set(dependencies),
  }) as const;
