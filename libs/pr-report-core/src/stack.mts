/**
 * Stacked pull requests: one whose base is another open pull request's head
 * branch, so that its diff is its own layer and nothing below it.
 *
 * The stack is read from the bases alone, because GitHub already holds it: a
 * pull request onto `a` is on top of whichever pull request is `a`'s. When
 * that one merges, GitHub moves the layer above it onto its base and rebases
 * it, so the base chain is the merge order, and everything that orders pull
 * requests here reads a parent as a `Merge-After:` on it. `open-pr --base`
 * writes that trailer too, so that the body states the order as it does for
 * every other; a stack made any other way, without one, counts all the same,
 * and one naming the parent is not counted twice.
 */

/** The fields a stack is read from. */
import { Arr } from 'ts-data-forge';

export type StackMember = Readonly<{
  number: number;
  headRef: string;
  baseRef: string;
  /**
   * Whether the head branch lives in a fork. A fork's branch is not a branch
   * of this repository, whatever its name, so it is never a parent.
   */
  fromFork: boolean;
}>;

/**
 * Which open pull request each stacked one is on, by number: child → parent.
 * A pull request that is not stacked has no entry.
 *
 * A base is a parent's head only when exactly one open pull request from this
 * repository heads it: a branch opened against two bases is two pull
 * requests, and which of them a layer above means cannot be told. Nothing
 * onto the default branch is stacked, even if some odd pull request heads it.
 */
export const findStackParents = (
  pulls: readonly StackMember[],
  defaultBranch: string,
): ReadonlyMap<number, number> => {
  const byHead = Map.groupBy(
    pulls.filter(({ fromFork }) => !fromFork),
    ({ headRef }) => headRef,
  );

  return new Map(
    pulls.flatMap(({ number, baseRef }) => {
      if (baseRef === defaultBranch) {
        return [];
      }

      const heads = byHead.get(baseRef) ?? [];

      return Arr.isFixedLengthArray(1, heads)
        ? [[number, heads[0].number] as const]
        : [];
    }),
  );
};

/**
 * Every layer above `number`, each after the one it is on — the order in
 * which they are moved when `number` moves. Siblings keep the lowest number
 * first.
 */
export const stackDescendants = (
  parents: ReadonlyMap<number, number>,
  number: number,
): readonly number[] => {
  const childrenOf = (n: number): readonly number[] =>
    Array.from(parents)
      .filter(([, parent]) => parent === n)
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
