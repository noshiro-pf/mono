import dedent from 'dedent';
import {
  findDuplicateKeys,
  isJsoncInScope,
} from './check-jsonc-duplicate-keys.mjs';

describe(findDuplicateKeys, () => {
  test('reports a duplicate at the top level and one in a nested object, with both lines', () => {
    const text = dedent`
      {
        "a": 1,
        "b": { "x": 1, "x": 2 },
        "a": 2
      }
    `;

    assert.deepStrictEqual(findDuplicateKeys('f.jsonc', text), [
      { key: 'a', firstLine: 2, line: 4 },
      { key: 'x', firstLine: 3, line: 3 },
    ]);
  });

  test('the same key in two different objects is not a duplicate', () => {
    const text = dedent`
      {
        "a": { "k": 1 },
        "b": { "k": 2 },
        "c": [{ "k": 3 }, { "k": 4 }]
      }
    `;

    assert.deepStrictEqual(findDuplicateKeys('f.jsonc', text), []);
  });

  test('comments and trailing commas neither hide a duplicate nor are reported', () => {
    const text = dedent`
      {
        // "a": 0,
        "a": 1, /* "a": 9 */
        "b": [1, 2,],
        "a": 2,
      }
    `;

    assert.deepStrictEqual(findDuplicateKeys('f.jsonc', text), [
      { key: 'a', firstLine: 3, line: 5 },
    ]);
  });
});

describe(isJsoncInScope, () => {
  test.each([
    'knip.jsonc',
    'languages/sumi/oxlint-config/oxlintrc.jsonc',
    'tsconfig.json',
    'libs/x/configs/tsconfig.build.json',
    'apps/y/tsconfig.json',
    '.vscode/settings.json',
  ])('takes %s', (file) => {
    assert.isTrue(isJsoncInScope(file));
  });

  test.each([
    'package.json',
    'apps/y/public/manifest.json',
    'experimental/old/tsconfig.json',
    'experimental/old/knip.jsonc',
    'apps/y/.vscode/settings.json',
  ])('leaves %s', (file) => {
    assert.isFalse(isJsoncInScope(file));
  });
});
