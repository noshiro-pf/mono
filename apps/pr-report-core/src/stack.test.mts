import { findStackParents, stackDescendants } from './stack.mjs';

/** `[number, head branch, base branch]`, none of them from a fork. */
const pulls = (
  rows: readonly (readonly [number, string, string])[],
): Parameters<typeof findStackParents>[0] =>
  rows.map(([number, headRef, baseRef]) => ({
    number,
    headRef,
    baseRef,
    fromFork: false,
  }));

describe(findStackParents, () => {
  test('a pull request onto the head branch of another is stacked on it', () => {
    const parents = findStackParents(
      pulls([
        [1, 'a', 'main'],
        [2, 'b', 'a'],
        [3, 'c', 'b'],
      ]),
      'main',
    );

    assert.deepStrictEqual(Array.from(parents), [
      [2, 1],
      [3, 2],
    ]);
  });

  test('a base no open pull request heads is not a stack', () => {
    // The parent has merged and its branch is gone, or the base is simply
    // another long-lived branch.
    assert.deepStrictEqual(
      Array.from(findStackParents(pulls([[2, 'b', 'a']]), 'main')),
      [],
    );
  });

  test('a fork cannot be a parent', () => {
    // Its head branch lives in the fork; a branch of the same name here is a
    // different branch.
    const parents = findStackParents(
      [
        { number: 1, headRef: 'a', baseRef: 'main', fromFork: true },
        { number: 2, headRef: 'b', baseRef: 'a', fromFork: false },
      ],
      'main',
    );

    assert.deepStrictEqual(Array.from(parents), []);
  });

  test('a fork can be a child', () => {
    // Its base is a branch of this repository all the same.
    const parents = findStackParents(
      [
        { number: 1, headRef: 'a', baseRef: 'main', fromFork: false },
        { number: 2, headRef: 'b', baseRef: 'a', fromFork: true },
      ],
      'main',
    );

    assert.deepStrictEqual(Array.from(parents), [[2, 1]]);
  });

  test('nothing onto the default branch is stacked, whatever heads it', () => {
    // A pull request *from* the default branch is odd but possible, and
    // reading it as a parent would put every other pull request under it.
    const parents = findStackParents(
      pulls([
        [1, 'main', 'release'],
        [2, 'b', 'main'],
      ]),
      'main',
    );

    assert.deepStrictEqual(Array.from(parents), []);
  });

  test('a branch two open pull requests head is not a parent', () => {
    // One branch opened against two bases: which of them the stack means
    // cannot be told, so neither is taken.
    const parents = findStackParents(
      pulls([
        [1, 'a', 'main'],
        [2, 'a', 'release'],
        [3, 'c', 'a'],
      ]),
      'main',
    );

    assert.deepStrictEqual(Array.from(parents), []);
  });
});

describe(stackDescendants, () => {
  test('every layer above, each after the one it is on', () => {
    const parents = new Map([
      [2, 1],
      [3, 2],
      [4, 1],
      [5, 3],
    ]);

    assert.deepStrictEqual(stackDescendants(parents, 1), [2, 4, 3, 5]);

    assert.deepStrictEqual(stackDescendants(parents, 3), [5]);

    assert.deepStrictEqual(stackDescendants(parents, 5), []);
  });

  test('a cycle ends the walk rather than the process', () => {
    // Two pull requests opened onto each other's branches. Nothing lands
    // either, and the merge order reports it as a cycle; the walk only has to
    // stop.
    const parents = new Map([
      [1, 2],
      [2, 1],
    ]);

    assert.deepStrictEqual(stackDescendants(parents, 1), [2]);
  });
});
