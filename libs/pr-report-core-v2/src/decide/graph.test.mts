import { PullRequestLabel } from '../conventions/index.mjs';
import type { ReadError } from '../snapshot/index.mjs';
import {
  buildForest,
  findCycles,
  findStackParents,
  inheritStartAfter,
  mergeGraph,
  NOTHING_UNREAD,
  stackDescendants,
  type GraphMember,
  type InheritanceUnread,
  type InheritedOrder,
} from './graph.mjs';

const BLOCKS_RELEASE_LABEL = PullRequestLabel.blocksRelease;

const MERGE_QUEUED_LABEL = PullRequestLabel.mergeQueued;

const NO_ISSUES = new Map<number, readonly number[]>();

describe(mergeGraph, () => {
  test('reads the declared order and the stack together, and the cycles in them', () => {
    const graph = mergeGraph(
      [
        member({ number: 1, body: 'Merge-After: #3' }),
        member({ number: 2, baseRef: 'feature/1' }),
        member({ number: 3, body: 'Merge-After: #1' }),
      ],
      'main',
      NO_ISSUES,
      new Set<number>(),
      NOTHING_UNREAD,
    );

    assert.deepStrictEqual(
      graph.stackParents,
      new Map<number, number>([[2, 1]]),
    );

    assert.deepStrictEqual(
      graph.dependencies,
      new Map<number, readonly number[]>([
        [1, [3]],
        [2, [1]],
        [3, [1]],
      ]),
    );

    assert.deepStrictEqual(graph.cycles, [[1, 3]]);
  });

  test('reads nothing the version pull request declares', () => {
    assert.deepStrictEqual(
      mergeGraph(
        [
          member({
            number: 1,
            headRef: 'changeset-release/main',
            body: 'Merge-After: #2',
          }),
          member({ number: 2 }),
        ],
        'main',
        NO_ISSUES,
        new Set<number>(),
        NOTHING_UNREAD,
      ).dependencies.get(1),
      [],
    );
  });

  test('a pull request also waits for what the issues it closes start after', () => {
    const graph = mergeGraph(
      [
        member({ number: 1, closes: [11] }),
        member({ number: 2, closes: [12] }),
        member({ number: 3, body: 'Merge-After: #1' }),
      ],
      'main',
      new Map<number, readonly number[]>([
        [11, [12]],
        [12, [3]],
      ]),
      new Set<number>(),
      NOTHING_UNREAD,
    );

    assert.deepStrictEqual(
      graph.dependencies,
      new Map<number, readonly number[]>([
        [1, [2]],
        [2, [3]],
        [3, [1]],
      ]),
    );

    assert.deepStrictEqual(
      graph.inherited,
      new Map<number, readonly number[]>([
        [1, [2]],
        [2, [3]],
        [3, []],
      ]),
    );

    // The inherited edges close the loop the declared one opens.
    assert.deepStrictEqual(graph.cycles, [[1, 2, 3]]);
  });

  test('lists what holds the release', () => {
    assert.deepStrictEqual(
      mergeGraph(
        [
          member({
            number: 1,
            labels: [BLOCKS_RELEASE_LABEL],
            isDraft: true,
          }),
          member({ number: 2 }),
        ],
        'main',
        NO_ISSUES,
        new Set<number>(),
        NOTHING_UNREAD,
      ).releaseBlockers,
      [{ number: 1, isDraft: true }],
    );
  });
});

describe(findCycles, () => {
  test('finds nothing in a chain', () => {
    assert.deepStrictEqual(
      findCycles(
        new Map<number, readonly number[]>([
          [3, [2]],
          [2, [1]],
          [1, []],
        ]),
      ),
      [],
    );
  });

  test('finds nothing in a diamond', () => {
    assert.deepStrictEqual(
      findCycles(
        new Map<number, readonly number[]>([
          [4, [2, 3]],
          [3, [1]],
          [2, [1]],
          [1, []],
        ]),
      ),
      [],
    );
  });

  test('finds a two-node cycle, starting at its lowest number', () => {
    assert.deepStrictEqual(
      findCycles(
        new Map<number, readonly number[]>([
          [2, [1]],
          [1, [2]],
        ]),
      ),
      [[1, 2]],
    );
  });

  test('finds a pull request that declares itself', () => {
    assert.deepStrictEqual(
      findCycles(new Map<number, readonly number[]>([[7, [7]]])),
      [[7]],
    );
  });

  test('reports a cycle once however it is entered', () => {
    // 9 and 10 both lead into the same cycle, and the walk enters it from a
    // different node each time.
    assert.deepStrictEqual(
      findCycles(
        new Map<number, readonly number[]>([
          [9, [1]],
          [10, [2]],
          [1, [2]],
          [2, [3]],
          [3, [1]],
        ]),
      ),
      [[1, 2, 3]],
    );
  });

  test('finds two independent cycles', () => {
    assert.deepStrictEqual(
      findCycles(
        new Map<number, readonly number[]>([
          [1, [2]],
          [2, [1]],
          [5, [6]],
          [6, [5]],
        ]),
      ),
      [
        [1, 2],
        [5, 6],
      ],
    );
  });

  test('reports a member whose only way back runs through a finished node', () => {
    // 3 → 2 → 1 → 3 is a cycle as well as 1 ⇄ 2; a walk from 1 finishes 2
    // before it reaches 3, so 3's edge into 2 must still put 3 on a cycle.
    const cycles = findCycles(
      new Map<number, readonly number[]>([
        [1, [2, 3]],
        [2, [1]],
        [3, [2]],
      ]),
    );

    assert.deepStrictEqual(cycles, [
      [1, 2],
      [1, 3, 2],
    ]);

    assert.deepStrictEqual(new Set(cycles.flat()), new Set<number>([1, 2, 3]));
  });

  test('follows an edge to a pull request that declared nothing', () => {
    assert.deepStrictEqual(
      findCycles(new Map<number, readonly number[]>([[1, [2]]])),
      [],
    );
  });
});

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
    // A pull request *from* the default branch is odd but possible, and reading
    // it as a parent would put every other pull request under it.
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
    // One branch opened against two bases: which of them the stack means cannot
    // be told, so neither is taken.
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
    const parents = new Map<number, number>([
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
    const parents = new Map<number, number>([
      [1, 2],
      [2, 1],
    ]);

    assert.deepStrictEqual(stackDescendants(parents, 1), [2]);
  });
});

/** `[pull request number, what it declares it merges after]`. */
const forest = (
  declared: readonly (readonly [number, readonly number[]])[],
): ReturnType<typeof buildForest> =>
  buildForest(declared.map(([number, mergeAfter]) => ({ number, mergeAfter })));

describe(buildForest, () => {
  test('a pull request with no declaration is a root of its own', () => {
    const { roots, cyclic } = forest([
      [1, []],
      [2, []],
    ]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [1, 2],
    );

    assert.deepStrictEqual(
      roots.map((r) => r.children.length),
      [0, 0],
    );

    assert.deepStrictEqual(Array.from(cyclic), []);
  });

  test('a declaration puts the dependent under what it waits for', () => {
    // `Merge-After: #1` on #2 means #1 merges first, so #1 is the parent.
    const { roots } = forest([
      [1, []],
      [2, [1]],
      [3, [2]],
    ]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [1],
    );

    const [root] = roots;

    assert.deepStrictEqual(
      root?.children.map((c) => c.number),
      [2],
    );

    assert.deepStrictEqual(
      root?.children[0]?.children.map((c) => c.number),
      [3],
    );
  });

  test('a number that names nothing open constrains nothing', () => {
    // #99 has merged or never existed: #2 is unblocked and stands as a root.
    const { roots } = forest([[2, [99]]]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [2],
    );
  });

  test('two parents list the pull request twice, expanded once', () => {
    const { roots } = forest([
      [1, []],
      [2, []],
      [3, [1, 2]],
      [4, [3]],
    ]);

    const under = (n: number): readonly TreeNodeLike[] =>
      roots.find((r) => r.number === n)?.children ?? [];

    assert.deepStrictEqual(
      under(1).map((c) => c.number),
      [3],
    );

    assert.deepStrictEqual(
      under(2).map((c) => c.number),
      [3],
    );

    // The subtree is drawn under the first parent only; the second is a
    // pointer, so a diamond does not double every branch below it.
    assert.strictEqual(under(1)[0]?.repeated, false);

    assert.deepStrictEqual(
      under(1)[0]?.children.map((c) => c.number),
      [4],
    );

    assert.strictEqual(under(2)[0]?.repeated, true);

    assert.deepStrictEqual(under(2)[0]?.children, []);
  });

  test('a cycle is reported, not drawn', () => {
    const { roots, cyclic } = forest([
      [1, [2]],
      [2, [1]],
      [3, []],
    ]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [3],
    );

    assert.deepStrictEqual(
      Array.from(cyclic).toSorted((a, b) => a - b),
      [1, 2],
    );
  });

  test('a pull request depending on itself is a cycle of one', () => {
    const { roots, cyclic } = forest([[1, [1]]]);

    assert.deepStrictEqual(roots, []);

    assert.deepStrictEqual(Array.from(cyclic), [1]);
  });
});

type TreeNodeLike = Readonly<{
  number: number;
  repeated: boolean;
  children: readonly TreeNodeLike[];
}>;

describe(inheritStartAfter, () => {
  test('an open pull request an issue names is merged after, as if declared', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1] },
          { number: 20, closes: [] },
        ],
        startAfterOf: new Map<number, readonly number[]>([[1, [20]]]),
        openIssues: new Set<number>([1]),
        unread: NOTHING_UNREAD,
      }),
      new Map<number, InheritedOrder>([
        [10, { mergeAfter: [20], notStarted: [], unread: undefined }],
        [20, { mergeAfter: [], notStarted: [], unread: undefined }],
      ]),
    );
  });

  test('an open issue named stands for the open pull requests closing it', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1] },
          { number: 21, closes: [2] },
          { number: 22, closes: [2] },
        ],
        startAfterOf: new Map<number, readonly number[]>([[1, [2]]]),
        openIssues: new Set<number>([1, 2]),
        unread: NOTHING_UNREAD,
      }).get(10),
      { mergeAfter: [21, 22], notStarted: [], unread: undefined },
    );
  });

  test('an open issue nobody has started holds nothing, and is said to be open', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [{ number: 10, closes: [1] }],
        startAfterOf: new Map<number, readonly number[]>([[1, [2]]]),
        openIssues: new Set<number>([1, 2]),
        unread: NOTHING_UNREAD,
      }).get(10),
      { mergeAfter: [], notStarted: [2], unread: undefined },
    );
  });

  test('what is done, abandoned or unknown constrains nothing', () => {
    // #3 is neither an open pull request nor an open issue: merged, closed,
    // or a number nobody described.
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [{ number: 10, closes: [1] }],
        startAfterOf: new Map<number, readonly number[]>([[1, [3]]]),
        openIssues: new Set<number>([1]),
        unread: NOTHING_UNREAD,
      }).get(10),
      { mergeAfter: [], notStarted: [], unread: undefined },
    );
  });

  test('never itself: neither named, nor as what closes the issue named', () => {
    // #10 closes both #1 and #2, so #1's wait for #2 is this very change.
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1, 2] },
          { number: 11, closes: [3] },
        ],
        startAfterOf: new Map<number, readonly number[]>([
          [1, [2]],
          [3, [11]],
        ]),
        openIssues: new Set<number>([1, 2, 3]),
        unread: NOTHING_UNREAD,
      }),
      new Map<number, InheritedOrder>([
        [10, { mergeAfter: [], notStarted: [], unread: undefined }],
        [11, { mergeAfter: [], notStarted: [], unread: undefined }],
      ]),
    );
  });

  test('every issue closed contributes, each number once, lowest first', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1, 2] },
          { number: 30, closes: [] },
          { number: 20, closes: [5] },
        ],
        startAfterOf: new Map<number, readonly number[]>([
          [1, [30, 5, 6]],
          [2, [5, 30, 6]],
        ]),
        openIssues: new Set<number>([1, 2, 5, 6]),
        unread: NOTHING_UNREAD,
      }).get(10),
      { mergeAfter: [20, 30], notStarted: [6], unread: undefined },
    );
  });

  test('an issue whose body was not read declares nothing', () => {
    assert.deepStrictEqual(
      inheritStartAfter({
        pulls: [{ number: 10, closes: [1] }],
        startAfterOf: new Map<number, readonly number[]>(),
        openIssues: new Set<number>([1]),
        unread: NOTHING_UNREAD,
      }).get(10),
      { mergeAfter: [], notStarted: [], unread: undefined },
    );
  });

  test('says what it could not read, and only what could change it', () => {
    const failed = { kind: 'unavailable', what: 'x', message: '502' } as const;

    const unreadOf = (
      unread: Partial<InheritanceUnread>,
      startAfterOf = new Map<number, readonly number[]>([[1, [2]]]),
    ): ReadonlyMap<number, InheritedOrder> =>
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1] },
          { number: 20, closes: [] },
        ],
        startAfterOf,
        openIssues: new Set<number>([1, 2]),
        unread: { ...NOTHING_UNREAD, ...unread },
      });

    // Its own closing issues, and the "blocked by" of an issue it closes.
    assert.strictEqual(
      unreadOf({ closes: new Map<number, ReadError>([[10, failed]]) }).get(10)
        ?.unread,
      failed,
    );

    assert.strictEqual(
      unreadOf({ waits: new Map<number, ReadError>([[1, failed]]) }).get(10)
        ?.unread,
      failed,
    );

    // An issue it closes whose body is missing, when the lists were unread.
    assert.strictEqual(
      unreadOf({ bodies: failed }, new Map<number, readonly number[]>()).get(10)
        ?.unread,
      failed,
    );

    // Another's closing issues, which could close the open issue #2 it names.
    assert.strictEqual(
      unreadOf({ closes: new Map<number, ReadError>([[20, failed]]) }).get(10)
        ?.unread,
      failed,
    );

    // ... but not when what it names is not an open issue.
    assert.isUndefined(
      unreadOf(
        { closes: new Map<number, ReadError>([[20, failed]]) },
        new Map<number, readonly number[]>([[1, [3]]]),
      ).get(10)?.unread,
    );

    assert.isUndefined(unreadOf({}).get(10)?.unread);

    // With the issue lists unread, a number named might be an open issue.
    assert.strictEqual(
      inheritStartAfter({
        pulls: [
          { number: 10, closes: [1] },
          { number: 20, closes: [] },
        ],
        startAfterOf: new Map<number, readonly number[]>([[1, [2]]]),
        openIssues: new Set<number>([1]),
        unread: {
          ...NOTHING_UNREAD,
          closes: new Map<number, ReadError>([[20, failed]]),
          bodies: failed,
        },
      }).get(10)?.unread,
      failed,
    );
  });
});

const member = (
  fields: Partial<GraphMember> & Readonly<{ number: number }>,
): GraphMember =>
  ({
    body: '',
    isDraft: false,
    labels: [MERGE_QUEUED_LABEL],
    headRef: `feature/${fields.number}`,
    baseRef: 'main',
    fromFork: false,
    closes: [],
    ...fields,
  }) as const;
