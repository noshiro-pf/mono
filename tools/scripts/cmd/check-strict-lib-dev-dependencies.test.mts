import {
  findRuntimeDependencyEdges,
  selectStrictLibMembers,
} from './check-strict-lib-dev-dependencies.mjs';

describe(selectStrictLibMembers, () => {
  test('keeps the converter and the harnesses, not the bundles or other members', () => {
    assert.deepStrictEqual(
      selectStrictLibMembers([
        { relativePath: 'strict-lib/scripts-common/package.json' },
        { relativePath: 'strict-lib/v7.0/package.json' },
        { relativePath: 'strict-lib/v7.0/output/lib/package.json' },
        { relativePath: 'strict-lib/v7.0/output/tools/package.json' },
        { relativePath: 'libs/ts-data-forge/package.json' },
      ]),
      [
        { relativePath: 'strict-lib/scripts-common/package.json' },
        { relativePath: 'strict-lib/v7.0/package.json' },
        { relativePath: 'strict-lib/v7.0/output/tools/package.json' },
      ],
    );
  });
});

describe(findRuntimeDependencyEdges, () => {
  test('reports a manifest that declares dependencies', () => {
    assert.deepStrictEqual(
      findRuntimeDependencyEdges([
        {
          relativePath: 'strict-lib/scripts-common/package.json',
          manifest: {
            private: true,
            dependencies: { 'ts-data-forge': '^1.0.0' },
          },
        },
        {
          relativePath: 'strict-lib/v7.0/package.json',
          manifest: {
            private: true,
            devDependencies: { 'strict-ts-lib-scripts-common': 'workspace:*' },
          },
        },
      ]),
      [
        {
          relativePath: 'strict-lib/scripts-common/package.json',
          fields: ['dependencies'],
        },
      ],
    );
  });

  test('reports optionalDependencies and peerDependencies too', () => {
    assert.deepStrictEqual(
      findRuntimeDependencyEdges([
        {
          relativePath: 'strict-lib/v6.0/package.json',
          manifest: {
            optionalDependencies: { a: '1.0.0' },
            peerDependencies: { b: '1.0.0' },
          },
        },
      ]),
      [
        {
          relativePath: 'strict-lib/v6.0/package.json',
          fields: ['optionalDependencies', 'peerDependencies'],
        },
      ],
    );
  });

  test('reports a harness whatever its private field says', () => {
    assert.deepStrictEqual(
      findRuntimeDependencyEdges([
        {
          relativePath: 'strict-lib/v7.1/package.json',
          manifest: { dependencies: { 'ts-data-forge': 'workspace:*' } },
        },
      ]),
      [
        {
          relativePath: 'strict-lib/v7.1/package.json',
          fields: ['dependencies'],
        },
      ],
    );
  });

  test('ignores an empty dependencies object', () => {
    assert.deepStrictEqual(
      findRuntimeDependencyEdges([
        {
          relativePath: 'strict-lib/v6.0/package.json',
          manifest: { private: true, dependencies: {} },
        },
      ]),
      [],
    );
  });
});
