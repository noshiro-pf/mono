import { mergeAfterTrailer, withStackParent } from './steps.mjs';

describe('mergeAfterTrailer', () => {
  test('is nothing when no pull request was named', () => {
    assert.isUndefined(mergeAfterTrailer([]));
  });

  test('writes the numbers on one line, in the declared order', () => {
    assert.strictEqual(
      mergeAfterTrailer([1901, 1903]),
      'Merge-After: #1901, #1903',
    );
  });
});

describe('withStackParent', () => {
  test('declares the layer below first when it is stacked', () => {
    assert.deepStrictEqual(withStackParent([1903], 1901), [1901, 1903]);
  });

  test('does not name the layer below twice', () => {
    assert.deepStrictEqual(withStackParent([1903, 1901], 1901), [1901, 1903]);
  });

  test('leaves the declaration alone when it is not stacked', () => {
    assert.deepStrictEqual(withStackParent([1903], undefined), [1903]);
  });
});
