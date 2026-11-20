import type { TreeNode } from 'pr-report-core';
import {
  foldableNumbersOf,
  layersBelow,
  tallyLayers,
  toggleFolded,
} from './stack-fold.mjs';

describe(layersBelow, () => {
  test('lists every layer below, nearest first, and skips one drawn in full elsewhere', () => {
    const tree = node(1, [
      node(2, [node(3, [node(4)])]),
      node(5, [node(3, [], true)]),
    ]);

    assert.deepStrictEqual(layersBelow(tree, drawn), [2, 3, 4, 5]);
  });

  test('leaves out one that is not drawn, and everything below it', () => {
    const tree = node(1, [node(2, [node(3)]), node(4)]);

    assert.deepStrictEqual(
      layersBelow(tree, (number) => number !== 2),
      [4],
    );
  });

  test('is empty for a pull request nothing waits on', () => {
    assert.deepStrictEqual(layersBelow(node(1), drawn), []);
  });
});

describe(foldableNumbersOf, () => {
  test('names the outermost pull request of each stack, not the layers inside it', () => {
    const roots = [
      node(1, [node(2, [node(3)])]),
      node(4),
      node(6, [node(7)]),
    ] as const;

    assert.deepStrictEqual(foldableNumbersOf(roots, drawn), [1, 6]);
  });

  test('skips one with only repeated pull requests below it', () => {
    const roots = [node(1, [node(2)]), node(5, [node(2, [], true)])] as const;

    assert.deepStrictEqual(foldableNumbersOf(roots, drawn), [1]);
  });

  test('looks below one with nothing drawn below it', () => {
    const roots = [node(1, [node(2)]), node(3, [node(4, [node(5)])])] as const;

    assert.deepStrictEqual(
      foldableNumbersOf(roots, (number) => number !== 2 && number !== 3),
      [],
    );
  });
});

describe(toggleFolded, () => {
  test('adds a number not folded and takes out one that is, keeping the rest in order', () => {
    assert.deepStrictEqual(toggleFolded([3, 7], 5), [3, 5, 7]);

    assert.deepStrictEqual(toggleFolded([3, 5, 7], 5), [3, 7]);
  });
});

describe(tallyLayers, () => {
  test('counts the layers by verdict, those with none yet apart, and drafts besides', () => {
    const tally = tallyLayers([
      { checks: 'passed', isDraft: false },
      { checks: 'passed', isDraft: false },
      { checks: 'failing', isDraft: false },
      { checks: 'pending', isDraft: true },
      { checks: 'paused', isDraft: false },
      { checks: 'reading', isDraft: false },
      { checks: 'unread', isDraft: true },
    ]);

    assert.deepStrictEqual(tally, {
      total: 7,
      passed: 2,
      failing: 1,
      pending: 1,
      paused: 1,
      reading: 1,
      unread: 1,
      drafts: 2,
    });
  });
});

const drawn = (): boolean => true;

const node = (
  number: number,
  children: readonly TreeNode[] = [],
  repeated = false,
): TreeNode => ({ number, children, repeated }) as const;
