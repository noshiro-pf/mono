/**
 * The merge graph (`spec/decisions.md`, "The merge graph"): what the open pull
 * requests say about one another — stacks, `Merge-After:`, what they inherit
 * from the issues they close, the cycles, what holds the release — and the
 * forest the page draws.
 */

import { Arr } from 'ts-data-forge';
import {
  hasLabel,
  isVersionBranch,
  parseMergeAfter,
  PullRequestLabel,
} from '../conventions/index.mjs';
import type { ReadError } from '../snapshot/index.mjs';

/**
 * What `number` must still merge after: its stack parent, its declared and its
 * inherited orders, the open ones only.
 */
export const openDependenciesOf = (
  graph: Readonly<{
    dependencies: MergeGraph['dependencies'];
    openNumbers: MergeGraph['openNumbers'];
  }>,
  number: number,
): readonly number[] =>
  (graph.dependencies.get(number) ?? []).filter((dependency) =>
    graph.openNumbers.has(dependency),
  );

/**
 * The graph of `pulls`, every open pull request of the repository.
 * `startAfterOf` is what each issue whose body was read waits for (its
 * `Start-After:` and "blocked by"); an issue missing from it waits for nothing.
 * `openIssues` is every open issue known. `unread` says what of the rest could
 * not be read.
 */
export const mergeGraph = (
  pulls: readonly GraphMember[],
  defaultBranch: string,
  startAfterOf: ReadonlyMap<number, readonly number[]>,
  openIssues: ReadonlySet<number>,
  unread: InheritanceUnread,
): MergeGraph => {
  const sorted = pulls.toSorted((a, b) => a.number - b.number);

  const stackParents = findStackParents(sorted, defaultBranch);

  const inheritedOrders = inheritStartAfter({
    pulls: sorted,
    startAfterOf,
    openIssues,
    unread,
  });

  // The version pull request declares and inherits nothing: its body is
  // rewritten on every push to the base. `blocks-release` orders it instead.
  const isVersion = (pr: GraphMember): boolean =>
    isVersionBranch(pr.headRef, defaultBranch);

  const declared = new Map<number, readonly number[]>(
    sorted.map((pr) => {
      const parent = stackParents.get(pr.number);

      return [
        pr.number,
        isVersion(pr)
          ? []
          : Arr.uniq([
              ...(parent === undefined ? [] : [parent]),
              ...parseMergeAfter(pr.body),
            ]),
      ];
    }),
  );

  const inherited = new Map<number, readonly number[]>(
    sorted.map((pr) => {
      const own = declared.get(pr.number) ?? [];

      return [
        pr.number,
        isVersion(pr)
          ? []
          : (inheritedOrders.get(pr.number)?.mergeAfter ?? []).filter(
              (number) => !own.includes(number),
            ),
      ];
    }),
  );

  const dependencies = new Map<number, readonly number[]>(
    sorted.map(({ number }) => [
      number,
      [...(declared.get(number) ?? []), ...(inherited.get(number) ?? [])],
    ]),
  );

  const cycles = findCycles(dependencies);

  return {
    stackParents,
    dependencies,
    inherited,
    notStarted: new Map<number, readonly number[]>(
      sorted.map((pr) => [
        pr.number,
        isVersion(pr) ? [] : (inheritedOrders.get(pr.number)?.notStarted ?? []),
      ]),
    ),
    cycles,
    cyclic: new Set(cycles.flat()),
    openNumbers: new Set(sorted.map(({ number }) => number)),
    inheritanceUnread: new Map<number, ReadError>(
      Arr.generate(function* () {
        for (const pr of sorted) {
          const error = inheritedOrders.get(pr.number)?.unread;

          if (error !== undefined && !isVersion(pr)) {
            yield [pr.number, error] as const;
          }
        }
      }),
    ),
    releaseBlockers: sorted
      .filter(({ labels }) => hasLabel(labels, PullRequestLabel.blocksRelease))
      .map(({ number, isDraft }) => ({ number, isDraft })),
  };
};

/**
 * Child → parent: a pull request whose base is the head branch of exactly one
 * other open pull request of this repository (not a fork's) is stacked on it.
 */
export const findStackParents = (
  pulls: readonly Readonly<{
    number: number;
    headRef: string;
    baseRef: string;
    fromFork: boolean;
  }>[],
  defaultBranch: string,
): ReadonlyMap<number, number> => {
  const byHead = Map.groupBy(
    pulls.filter(({ fromFork }) => !fromFork),
    ({ headRef }) => headRef,
  );

  return new Map(
    Arr.generate(function* () {
      for (const { number, baseRef } of pulls) {
        const heads =
          baseRef === defaultBranch
            ? ([] as const)
            : (byHead.get(baseRef) ?? []);

        if (Arr.isFixedLengthArray(1, heads)) {
          yield [number, heads[0].number] as const;
        }
      }
    }),
  );
};

/**
 * Every layer stacked above `number`, nearest first, each level in number
 * order.
 */
export const stackDescendants = (
  parents: ReadonlyMap<number, number>,
  number: number,
): readonly number[] => {
  const childrenOf = (parent: number): readonly number[] =>
    Array.from(parents)
      .filter(([, of]) => of === parent)
      .map(([child]) => child)
      .toSorted((a, b) => a - b);

  const mut_seen = new Set<number>([number]);

  const mut_order: number[] = [];

  let mut_frontier: readonly number[] = [number];

  while (Arr.isNonEmpty(mut_frontier)) {
    const next = mut_frontier
      .flatMap(childrenOf)
      .filter((child) => !mut_seen.has(child));

    for (const child of next) {
      mut_seen.add(child);

      mut_order.push(child);
    }

    mut_frontier = next;
  }

  return mut_order;
};

/**
 * Each open pull request's {@link InheritedOrder}. Not transitive: what the
 * pull requests named wait for in turn is their own business.
 */
export const inheritStartAfter = ({
  pulls,
  startAfterOf,
  openIssues,
  unread,
}: Readonly<{
  pulls: readonly Readonly<{ number: number; closes: readonly number[] }>[];
  startAfterOf: ReadonlyMap<number, readonly number[]>;
  /** Every open issue known. */
  openIssues: ReadonlySet<number>;
  unread: InheritanceUnread;
}>): ReadonlyMap<number, InheritedOrder> => {
  const open = new Set(pulls.map(({ number }) => number));

  // The closers of an open issue are read from every open pull request.
  const someClosesUnread = unread.closes.values().next().value;

  const unreadOf = (
    self: number,
    closes: readonly number[],
    named: readonly number[],
  ): ReadError | undefined =>
    unread.closes.get(self) ??
    closes
      .values()
      .map((issue) =>
        startAfterOf.has(issue) ? unread.waits.get(issue) : unread.bodies,
      )
      .find((error) => error !== undefined) ??
    (named.some(
      (number) =>
        !open.has(number) &&
        (openIssues.has(number) || unread.bodies !== undefined),
    )
      ? someClosesUnread
      : undefined);

  const closersByIssue = new Map<number, readonly number[]>(
    Arr.uniq(pulls.flatMap(({ closes }) => closes)).map((issue) => [
      issue,
      pulls
        .filter(({ closes }) => closes.includes(issue))
        .map(({ number }) => number),
    ]),
  );

  const closersOf = (issue: number): readonly number[] =>
    closersByIssue.get(issue) ?? [];

  return new Map(
    pulls.map(({ number: self, closes }) => {
      const named = Arr.uniq(
        closes.flatMap((issue) => startAfterOf.get(issue) ?? []),
      ).filter((number) => number !== self);

      const mergeAfter = Arr.uniq(
        named.flatMap((number) =>
          open.has(number) ? [number] : closersOf(number),
        ),
      ).filter((number) => number !== self);

      const notStarted = named.filter(
        (number) =>
          !open.has(number) &&
          openIssues.has(number) &&
          !Arr.isNonEmpty(closersOf(number)),
      );

      return [
        self,
        {
          mergeAfter: ascending(mergeAfter),
          notStarted: ascending(notStarted),
          unread: unreadOf(self, closes, named),
        },
      ] as const;
    }),
  );
};

/**
 * The cycles of `dependencies`, each the shortest cycle through the first
 * number (in key order) no earlier one covers, rotated to start at its lowest
 * number. Every number on any cycle is in at least one; a number that names
 * itself is a cycle of one.
 */
export const findCycles = (
  dependencies: ReadonlyMap<number, readonly number[]>,
): readonly (readonly number[])[] => {
  const mut_covered = new Set<number>();

  const mut_cycles = new Map<string, readonly number[]>();

  for (const node of dependencies.keys()) {
    if (mut_covered.has(node)) {
      continue;
    }

    const cycle = shortestCycleThrough(node, dependencies);

    if (cycle === undefined) {
      continue;
    }

    for (const member of cycle) {
      mut_covered.add(member);
    }

    const rotated = rotateToLowest(cycle);

    mut_cycles.set(rotated.join(','), rotated);
  }

  return Array.from(mut_cycles.values());
};

/**
 * The forest of `entries` by what each merges after: a pull request with
 * several predecessors is drawn under each, expanded under the first only.
 * Cycle members are not drawn.
 */
export const buildForest = (
  entries: readonly Readonly<{
    number: number;
    mergeAfter: readonly number[];
  }>[],
): Forest => {
  const open = new Set(entries.map(({ number }) => number));

  const dependencies = new Map(
    entries.map(({ number, mergeAfter }) => [
      number,
      Arr.uniq(mergeAfter.filter((after) => open.has(after))),
    ]),
  );

  const cycles = findCycles(dependencies);

  const cyclic = new Set(cycles.flat());

  const mut_children = new Map<number, readonly number[]>();

  const mut_roots: number[] = [];

  for (const { number } of entries.toSorted((a, b) => a.number - b.number)) {
    if (cyclic.has(number)) {
      continue;
    }

    const parents = (dependencies.get(number) ?? []).filter(
      (parent) => !cyclic.has(parent),
    );

    if (!Arr.isNonEmpty(parents)) {
      mut_roots.push(number);

      continue;
    }

    for (const parent of parents) {
      mut_children.set(
        parent,
        Arr.toPushed(mut_children.get(parent) ?? [], number),
      );
    }
  }

  const mut_expanded = new Set<number>();

  const visit = (number: number): ForestNode => {
    if (mut_expanded.has(number)) {
      return { number, repeated: true, children: [] };
    }

    mut_expanded.add(number);

    return {
      number,
      repeated: false,
      children: (mut_children.get(number) ?? [])
        .toSorted((a, b) => a - b)
        .map(visit),
    };
  };

  return { roots: mut_roots.map(visit), cyclic, cycles };
};

/** What {@link mergeGraph} reads of one open pull request. */
export type GraphMember = Readonly<{
  number: number;
  /** Where `Merge-After:` is read from. */
  body: string;
  isDraft: boolean;
  labels: readonly string[];
  headRef: string;
  baseRef: string;
  fromFork: boolean;
  /** The open issues it closes, whose `Start-After:` it inherits. */
  closes: readonly number[];
}>;

export type MergeGraph = Readonly<{
  /** Which open pull request each stacked one is on: child → parent. */
  stackParents: ReadonlyMap<number, number>;
  /**
   * What each must merge after: its stack parent, its `Merge-After:`, then what
   * it inherits, each once.
   */
  dependencies: ReadonlyMap<number, readonly number[]>;
  /** What each inherits, less what it declared or is stacked on. */
  inherited: ReadonlyMap<number, readonly number[]>;
  /**
   * The open issues the issues each closes name that no open pull request
   * closes: they hold nothing, and are reported.
   */
  notStarted: ReadonlyMap<number, readonly number[]>;
  cycles: readonly (readonly number[])[];
  /** Every number on a cycle. */
  cyclic: ReadonlySet<number>;
  openNumbers: ReadonlySet<number>;
  /**
   * Why what each inherits could not be read in full, for those it could not
   * ({@link InheritedOrder.unread}); never the version pull request.
   */
  inheritanceUnread: ReadonlyMap<number, ReadError>;
  /** The open pull requests labelled `blocks-release`, drafts included. */
  releaseBlockers: readonly Readonly<{ number: number; isDraft: boolean }>[];
}>;

/** What one pull request takes over from the issues it closes. */
export type InheritedOrder = Readonly<{
  /**
   * The open pull requests it merges after because of them: one an issue names,
   * or one closing an open issue an issue names. Lowest first, never itself.
   */
  mergeAfter: readonly number[];
  /**
   * The open issues named that no open pull request closes: they hold nothing,
   * and are reported. Lowest first.
   */
  notStarted: readonly number[];
  /**
   * Why this could miss something, if it could: its own closing issues unread,
   * the body or "blocked by" of an issue it closes unread, or — once an issue
   * it inherits from names an open issue — another open pull request's closing
   * issues unread.
   */
  unread: ReadError | undefined;
}>;

/** What the inputs of {@link inheritStartAfter} could not say. */
export type InheritanceUnread = Readonly<{
  /** The open pull requests whose closing issues could not be read. */
  closes: ReadonlyMap<number, ReadError>;
  /** The issues whose "blocked by" could not be read. */
  waits: ReadonlyMap<number, ReadError>;
  /** Why an issue missing from `startAfterOf` may have a body unread. */
  bodies: ReadError | undefined;
}>;

export const NOTHING_UNREAD: InheritanceUnread = {
  closes: new Map<number, ReadError>(),
  waits: new Map<number, ReadError>(),
  bodies: undefined,
} as const;

/** A pull request in the forest the page draws. */
export type ForestNode = Readonly<{
  number: number;
  /** Drawn in full under another parent already. */
  repeated: boolean;
  children: readonly ForestNode[];
}>;

export type Forest = Readonly<{
  /** The pull requests nothing open holds up, lowest first. */
  roots: readonly ForestNode[];
  cyclic: ReadonlySet<number>;
  cycles: readonly (readonly number[])[];
}>;

/** `start`, …, `end`, following `reachedFrom` back from `end`. */
const pathFromStart = (
  start: number,
  end: number,
  reachedFrom: ReadonlyMap<number, number>,
): readonly number[] => {
  const mut_reversed: number[] = [end];

  let mut_node = end;

  while (mut_node !== start) {
    const previous = reachedFrom.get(mut_node);

    if (previous === undefined) {
      break;
    }

    mut_reversed.push(previous);

    mut_node = previous;
  }

  return mut_reversed.toReversed();
};

/**
 * The shortest cycle through `start`, level by level, so that the first edge
 * back to it closes a shortest one; `undefined` when no path leads back.
 */
const shortestCycleThrough = (
  start: number,
  dependencies: ReadonlyMap<number, readonly number[]>,
): readonly number[] | undefined => {
  const mut_reachedFrom = new Map<number, number>();

  let mut_frontier: readonly number[] = [start];

  while (Arr.isNonEmpty(mut_frontier)) {
    const mut_next: number[] = [];

    for (const node of mut_frontier) {
      for (const next of dependencies.get(node) ?? []) {
        if (next === start) {
          return pathFromStart(start, node, mut_reachedFrom);
        }

        if (mut_reachedFrom.has(next)) {
          continue;
        }

        mut_reachedFrom.set(next, node);

        mut_next.push(next);
      }
    }

    mut_frontier = mut_next;
  }

  return undefined;
};

const ascending = (numbers: readonly number[]): readonly number[] =>
  numbers.toSorted((a, b) => a - b);

const rotateToLowest = (cycle: readonly number[]): readonly number[] => {
  if (!Arr.isNonEmpty(cycle)) {
    return cycle;
  }

  const at = cycle.indexOf(Math.min(...cycle));

  return at <= 0 ? cycle : [...cycle.slice(at), ...cycle.slice(0, at)];
};

if (import.meta.vitest !== undefined) {
  test(rotateToLowest, () => {
    assert.deepStrictEqual(rotateToLowest([2, 3, 1]), [1, 2, 3]);

    assert.deepStrictEqual(rotateToLowest([3, 1, 2]), [1, 2, 3]);

    assert.deepStrictEqual(rotateToLowest([7]), [7]);

    assert.deepStrictEqual(rotateToLowest([]), []);
  });
}
