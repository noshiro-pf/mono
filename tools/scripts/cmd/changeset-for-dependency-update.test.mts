import {
  isPublishable,
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
    };

    expect(runtimeDependenciesChanged(manifest, manifest)).toBe(false);
  });

  test.each(runtimeFields)('is true when %s moved', (field) => {
    const before = { name: 'p', [field]: { dep: '^1.0.0' } };

    const after = { name: 'p', [field]: { dep: '^1.1.0' } };

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
    const before = { name: 'p', devDependencies: { eslint: '^9.0.0' } };

    const after = { name: 'p', devDependencies: { eslint: '^9.1.0' } };

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

  // The ten `apps/*` packages. Naming one fails `changeset version`.
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
