import {
  forgottenExportsEntryPoints,
  readsForgottenExports,
  typesEntryPoints,
} from './forgotten-exports-scope.mjs';

describe(typesEntryPoints, () => {
  test('reads every types condition and declaration path, once each, but an internal one', () => {
    assert.deepStrictEqual(
      typesEntryPoints({
        '.': {
          import: { types: './dist/index.d.mts', default: './dist/index.mjs' },
        },
        './internal': {
          import: {
            types: './dist/internal.d.mts',
            default: './dist/internal.mjs',
          },
        },
        './again': './dist/index.d.mts',
        './extra': { types: './dist/extra.d.mts' },
        './package.json': './package.json',
      }),
      ['./dist/index.d.mts', './dist/extra.d.mts'],
    );
  });

  test('leaves out an internal subpath, which semantic versioning does not cover', () => {
    assert.deepStrictEqual(
      typesEntryPoints({
        './internal': { types: './dist/internal.d.mts' },
        './dom/internal': './dist/dom/internal.d.mts',
        './internal/dom': './dist/internal/dom.d.mts',
        './internals': './dist/internals.d.mts',
      }),
      ['./dist/internals.d.mts'],
    );
  });

  test('leaves out a pattern and a field that is not an object', () => {
    assert.deepStrictEqual(
      typesEntryPoints({ './*': { types: './dist/*.d.mts' } }),
      [],
    );

    assert.deepStrictEqual(typesEntryPoints(undefined), []);
  });
});

describe(readsForgottenExports, () => {
  const withTypes = {
    exports: { '.': { types: './dist/index.d.mts' } },
  } as const;

  test.each([
    [
      'a published package under libs/ with a types file',
      'libs/a',
      withTypes,
      true,
    ],
    ['one with no types file', 'libs/a', { exports: './src/index.mts' }, false],
    ['one outside libs/', 'apps/a', withTypes, false],
    [
      'a private one not listed',
      'libs/a',
      { ...withTypes, private: true },
      false,
    ],
  ] as const)('%s: %s', (_, dir, manifest, expected) => {
    assert.strictEqual(
      readsForgottenExports({ name: 'a', dir, manifest }, new Set<string>()),
      expected,
    );
  });

  test('a private one listed', () => {
    assert.isTrue(
      readsForgottenExports(
        { name: 'a', dir: 'libs/a', manifest: { ...withTypes, private: true } },
        new Set<string>(['a']),
      ),
    );
  });

  test('the listed private packages, by default', () => {
    assert.isTrue(
      readsForgottenExports({
        name: 'synstate-next',
        dir: 'libs/synstate-next',
        manifest: { ...withTypes, private: true },
      }),
    );
  });
});

describe(forgottenExportsEntryPoints, () => {
  const withTypes = {
    exports: { '.': { types: './dist/index.d.mts' } },
  } as const;

  test('the types files of a package read', () => {
    assert.deepStrictEqual(
      forgottenExportsEntryPoints(
        { name: 'a', dir: 'libs/a', manifest: withTypes },
        new Set<string>(),
      ),
      ['./dist/index.d.mts'],
    );
  });

  test.each([
    ['one outside libs/', 'apps/a', withTypes],
    ['a private one not listed', 'libs/a', { ...withTypes, private: true }],
  ] as const)('none for %s, whatever its types files', (_, dir, manifest) => {
    assert.deepStrictEqual(
      forgottenExportsEntryPoints(
        { name: 'a', dir, manifest },
        new Set<string>(),
      ),
      [],
    );
  });
});
