import {
  mergeAfterTrailer,
  withInheritedMergeAfter,
  withStackParent,
} from './steps.mjs';

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

describe('withInheritedMergeAfter', () => {
  test('adds the numbers to the trailer the body opens with', () => {
    assert.strictEqual(
      withInheritedMergeAfter('Merge-After: #1901\n\nProse.', [1905]),
      'Merge-After: #1901, #1905\n\nProse.',
    );
  });

  test('puts a trailer first when the body opens with prose', () => {
    assert.strictEqual(
      withInheritedMergeAfter('Prose.\n', [1905, 1907]),
      'Merge-After: #1905, #1907\n\nProse.\n',
    );
  });

  test('writes the trailer alone into an empty body', () => {
    assert.strictEqual(
      withInheritedMergeAfter('', [1905]),
      'Merge-After: #1905\n',
    );
  });

  test('leaves the body as it is when there is nothing to add', () => {
    assert.strictEqual(withInheritedMergeAfter('Prose.', []), 'Prose.');
  });
});
