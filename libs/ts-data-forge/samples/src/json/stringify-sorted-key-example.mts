// Example: src/json/json.mts (stringifySortedKey)
import { Json, Result } from 'ts-data-forge';

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

assert.ok(Result.isOk(sorted));
if (Result.isOk(sorted)) {
  // Keys should appear in alphabetical order
  const expected =
    '{"apple":2,"mango":3,"nested":{"alpha":"a","beta":"b","zulu":"z"},"zebra":1}';
  assert(sorted.value === expected);
}

// With formatting
const formatted = Json.stringifySortedKey(unorderedData, 2);
assert.ok(Result.isOk(formatted));
if (Result.isOk(formatted)) {
  // Check that keys are in order (first key should be "apple")
  assert.ok(
    formatted.value.indexOf('"apple"') < formatted.value.indexOf('"mango"'),
  );
  assert.ok(
    formatted.value.indexOf('"mango"') < formatted.value.indexOf('"nested"'),
  );
  assert.ok(
    formatted.value.indexOf('"nested"') < formatted.value.indexOf('"zebra"'),
  );
}
