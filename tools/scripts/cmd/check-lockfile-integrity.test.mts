import dedent from 'dedent';
import {
  findDanglingReferences,
  snapshotKeyOf,
} from './check-lockfile-integrity.mjs';

describe(findDanglingReferences, () => {
  test('accepts a consistent lockfile', () => {
    assert.deepStrictEqual(findDanglingReferences(consistentLockfile), {
      referenceCount: 7,
      danglingReferences: [],
    });
  });

  test('reports an importer pointing at a peer set no snapshot has', () => {
    // The shape #2232 met: one side of a rebase added a peer to vitest's
    // snapshot, the other side added an importer using the old one.
    const lockfile = consistentLockfile.replace(
      'version: 5.0.2(@types/node@26.6.3)',
      'version: 5.0.2(@opentelemetry/api@1.9.1)(@types/node@26.6.3)',
    );

    assert.deepStrictEqual(
      findDanglingReferences(lockfile).danglingReferences,
      [
        {
          lineNumber: 15,
          from: 'apps/a devDependencies.vitest',
          key: 'vitest@5.0.2(@opentelemetry/api@1.9.1)(@types/node@26.6.3)',
          missingFrom: 'snapshots',
        },
      ],
    );
  });

  test('reports a snapshot dependency with no snapshot', () => {
    const lockfile = consistentLockfile.replace(
      "      '@types/node': 26.6.3",
      "      '@types/node': 26.6.4",
    );

    assert.deepStrictEqual(
      findDanglingReferences(lockfile).danglingReferences,
      [
        {
          lineNumber: 39,
          from: 'vitest@5.0.2(@types/node@26.6.3)',
          key: '@types/node@26.6.4',
          missingFrom: 'snapshots',
        },
      ],
    );
  });

  test('reports a snapshot with no package', () => {
    const lockfile = consistentLockfile.replace(
      "  '@types/node@26.6.3':\n    resolution: {integrity: sha512-b}\n\n",
      '',
    );

    assert.deepStrictEqual(
      findDanglingReferences(lockfile).danglingReferences,
      [
        {
          lineNumber: 30,
          from: 'snapshots',
          key: '@types/node@26.6.3',
          missingFrom: 'packages',
        },
      ],
    );
  });

  test('checks each document against itself', () => {
    const lockfile = [
      dedent`
        ---
        lockfileVersion: '9.0'

        importers:

          .:
            packageManagerDependencies:
              pnpm:
                specifier: 1.0.0
                version: 1.0.0

        packages:

          pnpm@1.0.0:
            resolution: {integrity: sha512-p}

        snapshots:

          other@1.0.0: {}
      `,
      '',
      consistentLockfile,
    ].join('\n');

    assert.deepStrictEqual(
      findDanglingReferences(lockfile).danglingReferences,
      [
        {
          lineNumber: 10,
          from: '(root) packageManagerDependencies.pnpm',
          key: 'pnpm@1.0.0',
          missingFrom: 'snapshots',
        },
        {
          lineNumber: 19,
          from: 'snapshots',
          key: 'other@1.0.0',
          missingFrom: 'packages',
        },
      ],
    );
  });

  test('finds nothing to check in a file of another layout', () => {
    assert.deepStrictEqual(findDanglingReferences('{}\n'), {
      referenceCount: 0,
      danglingReferences: [],
    });
  });
});

describe(snapshotKeyOf, () => {
  test('prefixes a plain version with the name', () => {
    assert.strictEqual(
      snapshotKeyOf('vitest', '5.0.2(@types/node@26.6.3)'),
      'vitest@5.0.2(@types/node@26.6.3)',
    );
  });

  test('takes an alias as the key', () => {
    assert.strictEqual(
      snapshotKeyOf('typescript-7', 'typescript@7.0.2'),
      'typescript@7.0.2',
    );

    assert.strictEqual(
      snapshotKeyOf('react', '@preact/compat@18.3.2(preact@10.29.8)'),
      '@preact/compat@18.3.2(preact@10.29.8)',
    );
  });

  test('takes a file: dependency as the key', () => {
    assert.strictEqual(
      snapshotKeyOf('dom', 'lib-dom@file:output/lib/dom(typescript@5.0.4)'),
      'lib-dom@file:output/lib/dom(typescript@5.0.4)',
    );
  });

  test('resolves a link: dependency to nothing', () => {
    assert.isUndefined(snapshotKeyOf('a', 'link:libs/a'));

    assert.isUndefined(snapshotKeyOf('a', 'link:'));
  });
});

const consistentLockfile = dedent`
  lockfileVersion: '9.0'

  importers:

    .:
      devDependencies:
        a:
          specifier: workspace:*
          version: link:apps/a

    apps/a:
      devDependencies:
        vitest:
          specifier: 5.0.2
          version: 5.0.2(@types/node@26.6.3)
        typescript-7:
          specifier: npm:typescript@7.0.2
          version: typescript@7.0.2

  packages:

    '@types/node@26.6.3':
      resolution: {integrity: sha512-b}

    typescript@7.0.2:
      resolution: {integrity: sha512-c}

    vitest@5.0.2:
      resolution: {integrity: sha512-a}

  snapshots:

    '@types/node@26.6.3': {}

    typescript@7.0.2: {}

    vitest@5.0.2(@types/node@26.6.3):
      dependencies:
        '@types/node': 26.6.3
      optionalDependencies:
        typescript: 7.0.2
      transitivePeerDependencies:
        - supports-color
`;
