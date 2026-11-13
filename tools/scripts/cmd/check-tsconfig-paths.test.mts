import { baseUrlViolations } from './check-tsconfig-paths.mjs';

describe(baseUrlViolations, () => {
  test('refuses a baseUrl, saying to write paths relative to the file (#4030)', () => {
    const violations = baseUrlViolations('libs/a/tsconfig.json', {
      baseUrl: 'src',
      paths: { a: ['entry-point.mts'] },
    });

    assert.strictEqual(violations.length, 1);

    assert.include(
      violations[0]?.hint ?? '',
      'write `paths` relative to the configuration file',
    );
  });

  test('passes a configuration without one', () => {
    assert.deepStrictEqual(
      baseUrlViolations('libs/a/tsconfig.json', {
        paths: { a: ['./src/entry-point.mts'] },
      }),
      [],
    );
  });
});
