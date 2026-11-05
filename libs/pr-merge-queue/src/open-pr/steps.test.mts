import { parseMergeAfter } from 'pr-report-core';
import {
  existingConflict,
  mergeAfterTrailer,
  mergeBeforeCycle,
  mergeBeforeNote,
  resolveBase,
  undeclared,
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

describe(existingConflict, () => {
  const existing = { number: 1905, base: 'feat/lower' } as const;

  const none = { base: undefined, mergeAfter: [], mergeBefore: [] } as const;

  test('takes an open pull request when no base was asked for', () => {
    assert.isUndefined(existingConflict(existing, none));
  });

  test('takes an open pull request already on the base asked for', () => {
    assert.isUndefined(
      existingConflict(existing, { ...none, base: 'feat/lower' }),
    );
  });

  test('refuses an open pull request on another base, saying how to restack', () => {
    assert.strictEqual(
      existingConflict(existing, { ...none, base: 'main' }),
      '#1905 is open against feat/lower, not main, and open-pr does not move an open pull request. Change its base on GitHub and its Merge-After: to match, then run again; or run again with --base feat/lower.',
    );
  });

  test('refuses its own number in --merge-after', () => {
    assert.strictEqual(
      existingConflict(existing, { ...none, mergeAfter: [1901, 1905] }),
      '--merge-after #1905 names the pull request already open for this branch',
    );
  });

  test('refuses its own number in --merge-before', () => {
    assert.strictEqual(
      existingConflict(existing, { ...none, mergeBefore: [1905] }),
      '--merge-before #1905 names the pull request already open for this branch',
    );
  });
});

describe(resolveBase, () => {
  test('takes the base asked for first', () => {
    assert.strictEqual(
      resolveBase('feat/a', { base: 'feat/b' }, 'main'),
      'feat/a',
    );
  });

  test('keeps the base of the pull request already open', () => {
    assert.strictEqual(
      resolveBase(undefined, { base: 'feat/b' }, 'main'),
      'feat/b',
    );
  });

  test('targets the default branch otherwise', () => {
    assert.strictEqual(resolveBase(undefined, undefined, 'main'), 'main');
  });
});

describe(undeclared, () => {
  test('names what the body does not declare yet, in the order given', () => {
    assert.deepStrictEqual(
      undeclared('Merge-After: #1901\n\nProse.', [1903, 1901, 1905, 1903]),
      [1903, 1905],
    );
  });

  test('does not read a declaration shown in a fenced code block', () => {
    assert.deepStrictEqual(
      undeclared('```\nMerge-After: #1901\n```\n', [1901]),
      [1901],
    );
  });
});

// #2790: the cycle check before the push sees only what this run declares,
// not what the body already says or what the issues it closes add to it.
describe(mergeBeforeCycle, () => {
  test('names a --merge-before number the final body merges after', () => {
    assert.strictEqual(
      mergeBeforeCycle([7, 9], 'Merge-After: #9\n\nSummary.'),
      9,
    );
  });

  test('passes when the body names none of them', () => {
    assert.isUndefined(mergeBeforeCycle([7], 'Merge-After: #3\n\nSummary.'));

    assert.isUndefined(mergeBeforeCycle([7], 'Summary.'));
  });

  test('reads no declaration inside a code fence', () => {
    assert.isUndefined(
      mergeBeforeCycle([7], ['```md', 'Merge-After: #7', '```'].join('\n')),
    );
  });
});
