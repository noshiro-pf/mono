import { parseMergeAfter } from 'pr-report-core';
import {
  mergeAfterTrailer,
  mergeBeforeNote,
  withMergeAfter,
  withStackParent,
} from './steps.mjs';

describe(mergeAfterTrailer, () => {
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

describe(withStackParent, () => {
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

describe(withMergeAfter, () => {
  test('adds the numbers to the trailer the body opens with', () => {
    assert.strictEqual(
      withMergeAfter('Merge-After: #1901\n\nProse.', [1905]),
      'Merge-After: #1901, #1905\n\nProse.',
    );
  });

  // A body may open with lines a tool put there, an HTML comment above all;
  // the declaration it already has is the one to extend.
  test('adds the numbers to a trailer further down the body', () => {
    assert.strictEqual(
      withMergeAfter('<!-- marker -->\nMerge-After: #1901\n\nProse.', [1905]),
      '<!-- marker -->\nMerge-After: #1901, #1905\n\nProse.',
    );
  });

  test('extends the first trailer when there are several', () => {
    assert.strictEqual(
      withMergeAfter('Merge-After: #1901\nMerge-After: #1903', [1905]),
      'Merge-After: #1901, #1905\nMerge-After: #1903',
    );
  });

  // A fence is how a body shows a declaration without making one, as the
  // readers in `pr-report-core` agree.
  test('does not extend a trailer shown in a fenced code block', () => {
    assert.strictEqual(
      withMergeAfter('Prose.\n\n```\nMerge-After: #1901\n```\n', [1905]),
      'Merge-After: #1905\n\nProse.\n\n```\nMerge-After: #1901\n```\n',
    );
  });

  test('puts a trailer first when the body opens with prose', () => {
    assert.strictEqual(
      withMergeAfter('Prose.\n', [1905, 1907]),
      'Merge-After: #1905, #1907\n\nProse.\n',
    );
  });

  test('writes the trailer alone into an empty body', () => {
    assert.strictEqual(withMergeAfter('', [1905]), 'Merge-After: #1905\n');
  });

  test('leaves the body as it is when there is nothing to add', () => {
    assert.strictEqual(withMergeAfter('Prose.', []), 'Prose.');
  });
});

describe(mergeBeforeNote, () => {
  test('is nothing when no successor was named', () => {
    assert.isUndefined(mergeBeforeNote([]));
  });

  test('names the successors, in the order given', () => {
    assert.strictEqual(
      mergeBeforeNote([1905, 1907]),
      'Merges before #1905, #1907, whose `Merge-After:` names this one.',
    );
  });

  // The note is prose: it must not be read as a declaration of this pull
  // request's own order.
  test('declares nothing itself', () => {
    assert.deepStrictEqual(parseMergeAfter(mergeBeforeNote([1905]) ?? ''), []);
  });
});
