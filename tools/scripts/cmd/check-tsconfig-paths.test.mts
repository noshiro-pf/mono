import {
  baseUrlViolations,
  isCheckedTsconfig,
} from './check-tsconfig-paths.mjs';

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

describe(isCheckedTsconfig, () => {
  test("reads every tsconfig, the root's and an experimental-named sibling's included", () => {
    for (const file of [
      'tsconfig.json',
      'libs/a/tsconfig.json',
      'libs/a/configs/tsconfig.build.json',
      '.github/tsconfig.json',
      'experimental-x/tsconfig.json',
    ]) {
      assert.isTrue(isCheckedTsconfig(file));
    }
  });

  test('leaves out other files and the excluded directories', () => {
    for (const file of [
      'libs/a/jsconfig.json',
      'libs/a/tsconfig.json.bak',
      'libs/a/my-tsconfig.json',
      'experimental/x/tsconfig.json',
      'verify-npm-packages/x/tsconfig.json',
    ]) {
      assert.isFalse(isCheckedTsconfig(file));
    }
  });
});
