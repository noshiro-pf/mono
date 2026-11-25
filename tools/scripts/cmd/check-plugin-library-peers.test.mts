import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  checkPluginLibraryPeers,
  type WorkspaceManifest,
} from './check-plugin-library-peers.mjs';

describe('checkPluginLibraryPeers', () => {
  test('passes a plugin that names its library as an optional peer of its major', () => {
    const result = checkPluginLibraryPeers([
      library('synstate', '9.2.0'),
      plugin('eslint-plugin-synstate', { synstate: 'workspace:^9.0.0' }),
    ]);

    assert.deepStrictEqual(result, Result.ok(1));
  });

  test('reads the minor of a 0.x library as its major', () => {
    const result = checkPluginLibraryPeers([
      library('synstate-dom', '0.13.1'),
      plugin('eslint-plugin-synstate-dom', {
        'synstate-dom': 'workspace:^0.13.0',
      }),
    ]);

    assert.deepStrictEqual(result, Result.ok(1));
  });

  test('fails a plugin that does not name its library, saying what to write', () => {
    const result = checkPluginLibraryPeers([
      library('ts-data-forge', '15.1.1'),
      plugin('eslint-plugin-ts-data-forge', {}),
    ]);

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'eslint-plugin-ts-data-forge: peerDependencies has no "ts-data-forge"; write "ts-data-forge": "workspace:^15.0.0"',
    );
  });

  test('fails a bare range, which pnpm would resolve from the registry', () => {
    const result = checkPluginLibraryPeers([
      library('synstate', '9.2.0'),
      plugin('eslint-plugin-synstate', { synstate: '^9.0.0' }),
    ]);

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'eslint-plugin-synstate: peerDependencies has "synstate": "^9.0.0"; write "synstate": "workspace:^9.0.0"',
    );
  });

  test('fails a range that is not the major the library is at', () => {
    const result = checkPluginLibraryPeers([
      library('ts-data-forge', '15.1.1'),
      plugin('eslint-plugin-ts-data-forge', { 'ts-data-forge': '>=14.0.0' }),
    ]);

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'eslint-plugin-ts-data-forge: peerDependencies has "ts-data-forge": ">=14.0.0"; write "ts-data-forge": "workspace:^15.0.0"',
    );
  });

  test('fails a peer that is not optional', () => {
    const result = checkPluginLibraryPeers([
      library('synstate', '9.2.0'),
      {
        ...plugin('eslint-plugin-synstate', { synstate: 'workspace:^9.0.0' }),
        peerDependenciesMeta: {},
      },
    ]);

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'eslint-plugin-synstate: peerDependenciesMeta does not mark "synstate" optional',
    );
  });

  test('takes the longest library name the plugin is named after', () => {
    const result = checkPluginLibraryPeers([
      library('synstate', '9.2.0'),
      library('synstate-dom', '0.13.1'),
      plugin('eslint-plugin-synstate-dom-a11y', {
        'synstate-dom': 'workspace:^0.13.0',
      }),
    ]);

    assert.deepStrictEqual(result, Result.ok(1));
  });

  test('requires nothing of a plugin named after no library of the workspace', () => {
    const result = checkPluginLibraryPeers([
      library('ts-data-forge', '15.1.1'),
      plugin('eslint-plugin-ts-restrictions', {}),
      plugin('eslint-plugin-ts-data-forgery', {}),
    ]);

    assert.deepStrictEqual(result, Result.ok(0));
  });

  test('leaves out a private library and a private plugin', () => {
    const result = checkPluginLibraryPeers([
      { ...library('internal-lib', '0.1.0'), private: true },
      plugin('eslint-plugin-internal-lib', {}),
      library('synstate', '9.2.0'),
      { ...plugin('eslint-plugin-synstate', {}), private: true },
    ]);

    assert.deepStrictEqual(result, Result.ok(0));
  });
});

const library = (name: string, version: string): WorkspaceManifest =>
  ({ name, version }) as const;

const plugin = (
  name: string,
  peers: ReadonlyRecord<string, string>,
): WorkspaceManifest =>
  ({
    name,
    version: '1.0.0',
    peerDependencies: { eslint: '>=9.0.0', ...peers },
    peerDependenciesMeta: Object.fromEntries(
      Object.keys(peers).map((peer) => [peer, { optional: true }] as const),
    ),
  }) as const;
