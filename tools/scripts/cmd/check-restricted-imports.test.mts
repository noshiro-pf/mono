import { restrictedImportsOptions } from 'eslint-config-typed';
import { lacksIndexFilePattern } from './check-restricted-imports.mjs';

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
