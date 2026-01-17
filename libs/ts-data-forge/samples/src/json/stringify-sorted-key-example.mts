// Example: src/json/json.mts (stringifySortedKey)
import { isString, Json, Result } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const unorderedData = {
      zebra: 1,
      apple: 2,
      mango: 3,
      nested: {
        zulu: 'z',
        alpha: 'a',
        beta: 'b',
      },
    };

    // Keys will be sorted alphabetically at all levels
    const sorted = Json.stringifySortedKey(unorderedData);

    assert.isTrue(Result.isOk(sorted));

    if (Result.isOk(sorted)) {
      // Keys should appear in alphabetical order
      const expected =
        '{"apple":2,"mango":3,"nested":{"alpha":"a","beta":"b","zulu":"z"},"zebra":1}';

      assert.isTrue(sorted.value === expected);
    }

    // With formatting
    const formatted = Json.stringifySortedKey(unorderedData, 2);

    assert.isTrue(Result.isOk(formatted));

    if (Result.isOk(formatted)) {
      assert.isTrue(isString(formatted.value));

      // Check that keys are in order (first key should be "apple")
      assert.isTrue(
        formatted.value.indexOf('"apple"') < formatted.value.indexOf('"mango"'),
      );

      assert.isTrue(
        formatted.value.indexOf('"mango"') <
          formatted.value.indexOf('"nested"'),
      );

      assert.isTrue(
        formatted.value.indexOf('"nested"') <
          formatted.value.indexOf('"zebra"'),
      );
    }

    // embed-sample-code-ignore-below
  });
}
