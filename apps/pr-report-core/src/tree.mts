/** The merge order the pull requests declare, as a forest. */

import { Arr } from 'ts-data-forge';
import { findMergeAfterCycles } from './merge-after.mjs';
import { type TreeNode } from './types.mjs';

export type Forest = Readonly<{
  /** Pull requests nothing open is holding up, lowest number first. */
  roots: readonly TreeNode[];
  /** Every number on a `Merge-After` cycle. */
  cyclic: ReadonlySet<number>;
  /** The cycles themselves, each starting at its lowest number. */
  cycles: readonly (readonly number[])[];
}>;

/**
 * Turns the `Merge-After:` declarations into the tree they describe.
 *
 * The edge runs the way merging does: `Merge-After: #1901` on #1903 makes
 * #1901 the parent, so reading the tree top down reads the pull requests in
 * the order they can land. A number that names nothing still open constrains
 * nothing and is dropped — the pull request it named has merged, which is
 * exactly the constraint being satisfied.
 *
 * Two things a forest cannot hold are handled rather than drawn. A pull
 * request that declared several predecessors appears under each of them, but
 * is expanded under the first only ({@link TreeNode.repeated} marks the rest),
 * so a diamond does not duplicate everything below it. A pull request on a
 * cycle is left out altogether and reported through {@link Forest.cycles}:
 * every member of a cycle waits, in the end, for itself, so there is no
 * position in a merge order to draw it at.
 */
export const buildMergeAfterForest = (
  entries: readonly Readonly<{
    number: number;
    mergeAfter: readonly number[];
  }>[],
): Forest => {
  const open = new Set(entries.map(({ number }) => number));

  const dependencies = new Map(
    entries.map(({ number, mergeAfter }) => [
      number,
      Arr.uniq(mergeAfter.filter((n) => open.has(n))),
    ]),
  );

  const cycles = findMergeAfterCycles(dependencies);

  const cyclic = new Set(cycles.flat());

  const mut_children = new Map<number, readonly number[]>();

  const mut_roots: number[] = [];

  for (const { number } of entries.toSorted((a, b) => a.number - b.number)) {
    if (cyclic.has(number)) {
      continue;
    }

    const parents = (dependencies.get(number) ?? []).filter(
      (n) => !cyclic.has(n),
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

  const visit = (number: number): TreeNode => {
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
