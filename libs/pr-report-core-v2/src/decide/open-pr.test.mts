import { Result } from 'ts-data-forge';
import { parseMergeAfter } from '../conventions/index.mjs';
import {
  existingConflict,
  mergeAfterTrailer,
  mergeBeforeCycle,
  mergeBeforeNote,
  missingInheritedOrder,
  ownPullRequest,
  resolveBase,
  stackParent,
  successorRefusal,
  undeclared,
  withMergeAfter,
  withMergeBeforeNote,
  withStackParent,
} from './open-pr.mjs';

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

describe(ownPullRequest, () => {
  test('is the one open, or none', () => {
    assert.deepStrictEqual(
      ownPullRequest('b', [{ number: 5 }]),
      Result.ok({ number: 5 }),
    );

    assert.deepStrictEqual(ownPullRequest('b', []), Result.ok(undefined));
  });

  // Which one a run is about cannot be told.
  test('refuses two open from the branch', () => {
    assert.isTrue(
      Result.isErr(ownPullRequest('b', [{ number: 5 }, { number: 6 }])),
    );
  });
});

describe(stackParent, () => {
  test('is the one open pull request from the base', () => {
    assert.deepStrictEqual(stackParent('a', [{ number: 4 }]), Result.ok(4));
  });

  test('refuses none, or more than one', () => {
    assert.isTrue(Result.isErr(stackParent('a', [])));

    assert.isTrue(
      Result.isErr(stackParent('a', [{ number: 4 }, { number: 6 }])),
    );
  });
});

describe(successorRefusal, () => {
  test('lets an open pull request be written into', () => {
    assert.isUndefined(
      successorRefusal(7, { state: 'open', head: 'feature' }, 'main'),
    );
  });

  test('refuses one not open, and the version pull request', () => {
    expect(
      successorRefusal(7, { state: 'closed', head: 'feature' }, 'main'),
    ).toContain('closed');

    expect(
      successorRefusal(
        7,
        { state: 'open', head: 'changeset-release/main' },
        'main',
      ),
    ).toContain('blocks-release');
  });
});

describe(missingInheritedOrder, () => {
  // #5 closes #10, which starts after #11 (closed by the open #6) and the
  // open pull request #7.
  const order = {
    body: '',
    startAfterOf: new Map<number, readonly number[]>([[10, [11, 7]]]),
    others: [
      { number: 6, closes: [11] },
      { number: 7, closes: [] },
    ],
  } as const;

  test('names the open pull requests the closing issues start after', () => {
    assert.deepStrictEqual(missingInheritedOrder(5, order, []), [6, 7]);
  });

  test('leaves out what the body or this run declares already', () => {
    assert.deepStrictEqual(
      missingInheritedOrder(5, { ...order, body: 'Merge-After: #6\n' }, [7]),
      [],
    );
  });

  test('is nothing when no closing issue waits', () => {
    assert.deepStrictEqual(
      missingInheritedOrder(
        5,
        {
          body: '',
          startAfterOf: new Map<number, readonly number[]>(),
          others: [],
        },
        [],
      ),
      [],
    );
  });
});

describe(withMergeBeforeNote, () => {
  const note = 'Merges before #7, whose `Merge-After:` names this one.';

  test('goes under the Merge-After line a body opens with', () => {
    expect(withMergeBeforeNote('Merge-After: #4\n\nProse.', [7])).toBe(
      `Merge-After: #4\n${note}\n\nProse.`,
    );
  });

  test('goes at the top of a body without one', () => {
    expect(withMergeBeforeNote('Prose.', [7])).toBe(`${note}\n\nProse.`);

    expect(withMergeBeforeNote('', [7])).toBe(`${note}\n`);
  });

  test('rewrites the line there already, outside a code block, rather than adding one', () => {
    expect(
      withMergeBeforeNote(`Merge-After: #4\n${note} \n\nProse.`, [7, 8]),
    ).toBe(
      'Merge-After: #4\nMerges before #7, #8, whose `Merge-After:` names this one.\n\nProse.',
    );

    const fenced = `\`\`\`text\n${note}\n\`\`\`` as const;

    expect(withMergeBeforeNote(fenced, [7])).toBe(`${note}\n\n${fenced}`);
  });

  test("leaves a person's sentence that starts the same way", () => {
    expect(
      withMergeBeforeNote('Merges before #12 lands, all is frozen.', [7]),
    ).toBe(`${note}\n\nMerges before #12 lands, all is frozen.`);
  });

  test('is left as it is when it says so already, or names none', () => {
    expect(withMergeBeforeNote(`${note}\n\nProse.`, [7])).toBe(
      `${note}\n\nProse.`,
    );

    expect(withMergeBeforeNote('Prose.', [])).toBe('Prose.');
  });
});
