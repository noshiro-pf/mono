import { restrictedImportsOptions } from 'eslint-config-typed';
import * as path from 'node:path';
import {
  createPackageEslint,
  resolveRules,
} from '../lib/eslint-package-configs.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import {
  lacksIndexFilePattern,
  toSumiProbe,
} from './check-restricted-imports.mjs';

describe(lacksIndexFilePattern, () => {
  const [indexFilePattern] = restrictedImportsOptions.patterns;

  test('a rule that is off lacks nothing', () => {
    assert.isFalse(lacksIndexFilePattern(undefined));

    assert.isFalse(lacksIndexFilePattern(0));

    assert.isFalse(lacksIndexFilePattern([0, { paths: [] }]));

    assert.isFalse(lacksIndexFilePattern('off'));
  });

  test('the base options keep the pattern', () => {
    assert.isFalse(lacksIndexFilePattern([2, restrictedImportsOptions]));

    assert.isFalse(lacksIndexFilePattern(['error', restrictedImportsOptions]));
  });

  test('the pattern among others is kept, whatever its message', () => {
    assert.isFalse(
      lacksIndexFilePattern([
        2,
        {
          paths: [{ name: 'firebase/firestore' }],
          patterns: [
            { group: ['@firebase/firestore'] },
            { regex: indexFilePattern.regex, message: 'another message' },
          ],
        },
      ]),
    );
  });

  test('options set again without the pattern lack it', () => {
    assert.isTrue(
      lacksIndexFilePattern([2, { paths: [{ name: 'ts-type-forge' }] }]),
    );

    assert.isTrue(
      lacksIndexFilePattern([1, { patterns: [{ group: ['firebase/*'] }] }]),
    );
  });

  test('the rule on with no options, or the list form, lacks it', () => {
    assert.isTrue(lacksIndexFilePattern(2));

    assert.isTrue(lacksIndexFilePattern([2]));

    assert.isTrue(lacksIndexFilePattern([2, 'lodash', 'underscore']));
  });
});

describe(toSumiProbe, () => {
  const sumiOff = {
    name: 'sumi/off-for-sumi-check',
    files: ['src/**'],
    rules: { 'no-restricted-imports': 'off', 'no-shadow': 'off' },
  } as const;

  test('the Sumi off-config sets the rule to the base options alone', () => {
    assert.deepStrictEqual(toSumiProbe(sumiOff), {
      name: 'sumi/off-for-sumi-check',
      files: ['src/**'],
      rules: { 'no-restricted-imports': ['error', restrictedImportsOptions] },
    });
  });

  test('an off-config that leaves the rule alone exempts nothing', () => {
    assert.deepStrictEqual(
      toSumiProbe({ ...sumiOff, rules: { 'no-shadow': 'off' } }),
      { ...sumiOff, rules: {} },
    );

    assert.deepStrictEqual(
      toSumiProbe({
        ...sumiOff,
        rules: { 'no-restricted-imports': ['error', { paths: [] }] },
      }),
      { ...sumiOff, rules: {} },
    );
  });

  test('another block keeps what it matches, with its rules emptied', () => {
    assert.deepStrictEqual(
      toSumiProbe({
        files: ['src/**'],
        ignores: ['src/api/**'],
        rules: { 'no-restricted-imports': 'off' },
      }),
      { files: ['src/**'], ignores: ['src/api/**'], rules: {} },
    );
  });

  test('a block of ignores alone stays a global ignore', () => {
    assert.deepStrictEqual(toSumiProbe({ ignores: ['docs/**'] }), {
      ignores: ['docs/**'],
    });
  });
});

describe('the Sumi probe, resolved by ESLint', () => {
  const configs = [
    { files: ['**/*.mts'] },
    {
      name: 'sumi/off-for-sumi-check',
      files: ['src/**'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      ignores: ['src/api/**'],
      rules: { 'no-restricted-imports': ['error', { paths: [] }] },
    },
  ] as const;

  const eslint = createPackageEslint('tools', configs.map(toSumiProbe));

  const probe = async (file: string): Promise<unknown> => {
    const rules = await resolveRules(
      eslint,
      path.join(projectRootPath, 'tools', file),
    );

    assert.isDefined(rules);

    return rules['no-restricted-imports'];
  };

  test('a file the off-config matches gets the base options', async () => {
    assert.deepStrictEqual(await probe('src/a.mts'), [
      2,
      restrictedImportsOptions,
    ]);
  });

  test('a block of ignores and rules is not turned into a global ignore', async () => {
    assert.deepStrictEqual(await probe('src/api/b.mts'), [
      2,
      restrictedImportsOptions,
    ]);
  });

  test('a file the off-config does not match has the rule unset', async () => {
    assert.isUndefined(await probe('test/c.mts'));
  });
});
