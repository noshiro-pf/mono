import { isRecord } from 'ts-data-forge';
import {
  bundledPackages,
  isPublishable,
  parseLockfile,
  renderChangeset,
  runtimeDependenciesChanged,
  runtimeFields,
} from './changeset-for-dependency-update.mjs';

describe('runtimeDependenciesChanged', () => {
  test('is false when nothing moved', () => {
    const manifest = {
      name: 'ts-data-forge',
      dependencies: { 'ts-type-forge': '^4.0.0' },
      devDependencies: { eslint: '^9.0.0' },
    } as const;

    expect(runtimeDependenciesChanged(manifest, manifest)).toBe(false);
  });

  test.each(runtimeFields)('is true when %s moved', (field) => {
    const before = { name: 'p', [field]: { dep: '^1.0.0' } } as const;

    const after = { name: 'p', [field]: { dep: '^1.1.0' } } as const;

    expect(runtimeDependenciesChanged(after, before)).toBe(true);
  });

  test('is true when a runtime dependency is added', () => {
    expect(
      runtimeDependenciesChanged({ dependencies: { a: '^1.0.0' } }, {}),
    ).toBe(true);
  });

  test('is true when a runtime dependency is dropped', () => {
    expect(
      runtimeDependenciesChanged({}, { dependencies: { a: '^1.0.0' } }),
    ).toBe(true);
  });

  // The whole point of the classification: a devDependency bump publishes
  // nothing, and a changeset for it would release every package on every run.
  test('is false when only devDependencies moved', () => {
    const before = {
      name: 'p',
      devDependencies: { eslint: '^9.0.0' },
    } as const;

    const after = { name: 'p', devDependencies: { eslint: '^9.1.0' } } as const;

    expect(runtimeDependenciesChanged(after, before)).toBe(false);
  });

  // An absent field and an empty one are the same thing to a consumer.
  test('is false when an empty field appears', () => {
    expect(runtimeDependenciesChanged({ dependencies: {} }, {})).toBe(false);
  });
});

describe('isPublishable', () => {
  test('accepts a named public package', () => {
    expect(isPublishable({ name: 'ts-data-forge' })).toBe(true);
  });

  // The `apps/*` packages, judged by `bundledPackages` when they ship a bundle
  // and not at all otherwise.
  test('rejects a private package', () => {
    expect(isPublishable({ name: 'app', private: true })).toBe(false);
  });

  test('rejects a manifest with no name', () => {
    expect(isPublishable({ private: false })).toBe(false);
  });
});

describe('renderChangeset', () => {
  test('names every package in the front matter', () => {
    const text = renderChangeset(['ts-data-forge', 'ts-type-forge']);

    expect(text).toBe(
      [
        '---',
        "'ts-data-forge': patch",
        "'ts-type-forge': patch",
        '---',
        '',
        'Update dependencies',
        '',
      ].join('\n'),
    );
  });

  test('ends with a newline, as a markdown file should', () => {
    expect(renderChangeset(['p']).endsWith('\n')).toBe(true);
  });
});

describe('bundledPackages', () => {
  // The shape of `pnpm-lock.yaml` (lockfile v9): an extension whose runtime
  // dependencies are workspace links, one of which reaches a registry package.
  const lockfile = {
    importers: {
      'apps/ext': {
        dependencies: {
          'app-lib': { specifier: 'workspace:*', version: 'link:../app-lib' },
          'lib-a': {
            specifier: 'workspace:*',
            version: 'link:../../libs/lib-a',
          },
        },
        devDependencies: {
          vite: { specifier: 'catalog:', version: '8.0.0' },
        },
      },
      'apps/app-lib': {
        dependencies: {
          'lib-a': {
            specifier: 'workspace:*',
            version: 'link:../../libs/lib-a',
          },
        },
      },
      'libs/lib-a': {
        dependencies: {
          react: { specifier: '^19.0.0', version: '19.1.0' },
        },
        optionalDependencies: {
          fsevents: { specifier: '^2.0.0', version: '2.3.3' },
        },
        devDependencies: {
          eslint: { specifier: 'catalog:', version: '10.0.0' },
        },
      },
    },
    snapshots: {
      'react@19.1.0': { dependencies: { scheduler: '0.26.0' } },
      'scheduler@0.26.0': {},
      'fsevents@2.3.3': { optional: true },
      'vite@8.0.0': {},
      'eslint@10.0.0': {},
    },
  } as const;

  test('follows runtime dependencies through workspace links into the registry', () => {
    expect(bundledPackages(lockfile, 'apps/ext')).toStrictEqual([
      'fsevents@2.3.3',
      'react@19.1.0',
      'scheduler@0.26.0',
    ]);
  });

  // The toolchain moves on almost every run; counting it would bump every
  // extension every week.
  test('leaves devDependencies out, the extension’s and its links’', () => {
    const bundled = bundledPackages(lockfile, 'apps/ext');

    expect(bundled).not.toContain('vite@8.0.0');

    expect(bundled).not.toContain('eslint@10.0.0');
  });

  test('moves when a transitive registry version moves', () => {
    const updated = {
      ...lockfile,
      snapshots: {
        ...lockfile.snapshots,
        'react@19.1.0': { dependencies: { scheduler: '0.27.0' } },
        'scheduler@0.27.0': {},
      },
    } as const;

    expect(bundledPackages(updated, 'apps/ext')).not.toStrictEqual(
      bundledPackages(lockfile, 'apps/ext'),
    );
  });

  // `typescript-native: npm:typescript@7.0.2` is recorded with the target's
  // name in `version`, and the snapshot is keyed by it alone.
  test('resolves an aliased dependency by its target', () => {
    const aliased = {
      importers: {
        'apps/ext': {
          dependencies: {
            'react-alias': {
              specifier: 'npm:react@19.1.0',
              version: 'react@19.1.0',
            },
          },
        },
      },
      snapshots: { 'react@19.1.0': {} },
    } as const;

    expect(bundledPackages(aliased, 'apps/ext')).toStrictEqual([
      'react@19.1.0',
    ]);
  });

  // A peer-suffixed version is part of the key, so a peer moving is a move.
  test('keeps the peer suffix of a snapshot key', () => {
    const withPeers = {
      importers: {
        'apps/ext': {
          dependencies: {
            'react-dom': {
              specifier: '^19.0.0',
              version: '19.1.0(react@19.1.0)',
            },
          },
        },
      },
      snapshots: {
        'react-dom@19.1.0(react@19.1.0)': { dependencies: { react: '19.1.0' } },
        'react@19.1.0': {},
      },
    } as const;

    expect(bundledPackages(withPeers, 'apps/ext')).toStrictEqual([
      'react-dom@19.1.0(react@19.1.0)',
      'react@19.1.0',
    ]);
  });

  test('survives a dependency cycle', () => {
    const cyclic = {
      importers: {
        'apps/ext': {
          dependencies: { a: { specifier: '^1.0.0', version: '1.0.0' } },
        },
      },
      snapshots: {
        'a@1.0.0': { dependencies: { b: '1.0.0' } },
        'b@1.0.0': { dependencies: { a: '1.0.0' } },
      },
    } as const;

    expect(bundledPackages(cyclic, 'apps/ext')).toStrictEqual([
      'a@1.0.0',
      'b@1.0.0',
    ]);
  });

  // `autoInstallPeers` puts a linked library's peer into its `dependencies`;
  // the consumer provides it, so it is not the library's to bundle.
  test('leaves out the peers of a linked package, not the extension’s own', () => {
    const withPeer = {
      importers: {
        'apps/ext': {
          dependencies: {
            'lib-a': {
              specifier: 'workspace:*',
              version: 'link:../../libs/lib-a',
            },
            react: { specifier: '^19.0.0', version: '19.1.0' },
          },
        },
        'libs/lib-a': {
          dependencies: {
            react: { specifier: '^19.0.0', version: '19.1.0' },
            typescript: { specifier: '>=4.8', version: '6.0.3' },
          },
        },
      },
      snapshots: { 'react@19.1.0': {}, 'typescript@6.0.3': {} },
    } as const;

    expect(bundledPackages(withPeer, 'apps/ext', peersOfFixture)).toStrictEqual(
      ['react@19.1.0'],
    );
  });

  // A package the update added has no importer entry in the baseline.
  test('is empty for an importer the lockfile does not have', () => {
    expect(bundledPackages(lockfile, 'apps/new')).toStrictEqual([]);

    expect(bundledPackages(undefined, 'apps/ext')).toStrictEqual([]);
  });
});

describe('parseLockfile', () => {
  test('reads the workspace document, the last of the two', () => {
    const text = [
      '---',
      "lockfileVersion: '9.0'",
      'importers:',
      '  .:',
      '    packageManagerDependencies: {}',
      '',
      '---',
      "lockfileVersion: '9.0'",
      'importers:',
      '  apps/ext:',
      '    dependencies: {}',
      '',
    ].join('\n');

    const importers = parseLockfile(text)['importers'];

    assert.isTrue(isRecord(importers));

    expect(Object.keys(importers)).toStrictEqual(['apps/ext']);
  });

  // The package manager's own document has `importers` too.
  test('throws when only the package manager’s document is there', () => {
    const text = [
      "lockfileVersion: '9.0'",
      'importers:',
      '  .:',
      '    packageManagerDependencies: {}',
      '',
    ].join('\n');

    expect(() => parseLockfile(text)).toThrow(/layout has probably changed/u);
  });

  // A workspace of one package names `.` alone.
  test('reads a workspace document whose only importer is `.`', () => {
    const text = [
      "lockfileVersion: '9.0'",
      'importers:',
      '  .:',
      '    dependencies: {}',
      '',
    ].join('\n');

    const importers = parseLockfile(text)['importers'];

    assert.isTrue(isRecord(importers));

    expect(Object.keys(importers)).toStrictEqual(['.']);
  });

  // As this repository's lockfile is laid out, but for a workspace of one.
  test('tells the two documents apart when both name `.` alone', () => {
    const text = [
      '---',
      "lockfileVersion: '9.0'",
      'importers:',
      '  .:',
      '    configDependencies: {}',
      '    packageManagerDependencies: {}',
      '',
      '---',
      "lockfileVersion: '9.0'",
      'importers:',
      '  .:',
      '    dependencies:',
      '      react:',
      "        specifier: '^19.0.0'",
      '        version: 19.1.0',
      '',
    ].join('\n');

    const importers = parseLockfile(text)['importers'];

    assert.isTrue(isRecord(importers));

    const root = importers['.'];

    assert.isTrue(isRecord(root));

    expect(Object.keys(root)).toStrictEqual(['dependencies']);
  });

  test('throws on a document with no importers', () => {
    expect(() => parseLockfile("lockfileVersion: '9.0'\n")).toThrow(
      /layout has probably changed/u,
    );
  });
});

/** The extension names `react` as a peer; the library it links, `react` and `typescript`. */
const peersOfFixture = (importerPath: string): ReadonlySet<string> =>
  importerPath === 'apps/ext'
    ? new Set<string>(['react'])
    : new Set<string>(['react', 'typescript']);
