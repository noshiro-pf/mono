import type { TreeNode } from 'pr-report-core';
import {
  foldableNumbersOf,
  foldChoicesFrom,
  foldedNumbersOf,
  layersBelow,
  MAX_FOLD_CHOICES,
  stackNumbersOf,
  tallyLayers,
  withFoldChoices,
  type FoldChoice,
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

describe(foldedNumbersOf, () => {
  test('folds what was chosen folded, and nothing else, when stacks start unfolded', () => {
    assert.deepStrictEqual(
      foldedNumbersOf([choice(7, true), choice(3, true), choice(1, false)], {
        foldable: [1, 5],
        foldByDefault: false,
      }),
      [3, 7],
    );
  });

  test('folds every foldable pull request not chosen unfolded, when stacks start folded', () => {
    assert.deepStrictEqual(
      foldedNumbersOf([choice(1, false), choice(9, true)], {
        foldable: [1, 5, 6],
        foldByDefault: true,
      }),
      [5, 6, 9],
    );
  });
});

describe(stackNumbersOf, () => {
  test('is the pull request and every layer below where it is drawn in full', () => {
    const roots = [
      node(1, [node(2, [node(3)])]),
      node(5, [node(2, [], true)]),
    ] as const;

    assert.deepStrictEqual(stackNumbersOf(roots, 1, drawn), [1, 2, 3]);

    assert.deepStrictEqual(stackNumbersOf(roots, 2, drawn), [2, 3]);

    assert.deepStrictEqual(stackNumbersOf(roots, 5, drawn), [5]);
  });

  test('is the number alone when the tree does not have it', () => {
    assert.deepStrictEqual(stackNumbersOf([node(1)], 9, drawn), [9]);
  });
});

describe(withFoldChoices, () => {
  test('puts the choices last, the first of them last of all, replacing earlier ones for the same numbers', () => {
    assert.deepStrictEqual(
      withFoldChoices(
        [choice(3, true), choice(5, true), choice(7, false)],
        [3, 7],
        true,
      ),
      [choice(5, true), choice(7, true), choice(3, true)],
    );
  });

  test(`keeps the latest ${MAX_FOLD_CHOICES} choices only`, () => {
    const full = Array.from({ length: MAX_FOLD_CHOICES }, (_, index) =>
      choice(index + 1, true),
    );

    const added = withFoldChoices(full, [9998, 9999], false);

    assert.strictEqual(added.length, MAX_FOLD_CHOICES);

    assert.deepStrictEqual(added[0], choice(3, true));

    assert.deepStrictEqual(added.at(-1), choice(9998, false));
  });
});

describe(foldChoicesFrom, () => {
  test('reads back what was saved', () => {
    const saved = [choice(4, true), choice(8, false)] as const;

    assert.deepStrictEqual(foldChoicesFrom(saved), saved);
  });

  test('drops what is not a choice, and reads anything but a list as none', () => {
    assert.deepStrictEqual(
      foldChoicesFrom([
        choice(4, true),
        { number: '5', folded: true },
        { number: 6, folded: 'yes' },
        { number: -1, folded: true },
        { number: 1.5, folded: true },
        null,
        choice(4, false),
      ]),
      [choice(4, false)],
    );

    assert.deepStrictEqual(foldChoicesFrom(undefined), []);

    assert.deepStrictEqual(foldChoicesFrom({ number: 1, folded: true }), []);
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

const choice = (number: number, folded: boolean): FoldChoice =>
  ({ number, folded }) as const;

const node = (
  number: number,
  children: readonly TreeNode[] = [],
  repeated = false,
): TreeNode => ({ number, children, repeated }) as const;
