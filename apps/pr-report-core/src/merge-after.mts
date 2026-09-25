/**
 * The order the pull requests declare, read from `Merge-After:` trailers in
 * their bodies.
 */

import { Arr, Num, Result } from 'ts-data-forge';

/**
 * `Merge-After: #1901, #1903` in a pull request body, anywhere in it, on as
 * many lines as it likes. Only this exact trailer is read — a sentence
 * mentioning another pull request is prose, and treating it as a declaration
 * would make every cross-reference a merge constraint.
 */
const MERGE_AFTER_LINE = /^[^\S\n]*merge-after[^\S\n]*:(?<refs>[^\n]*)$/gimu;

const PULL_REQUEST_REF = /#(?<number>\d+)/gu;

/** The opening or closing line of a fenced code block. */
const FENCE_LINE = /^[^\S\n]*(?:`{3,}|~{3,})/u;

/**
 * The pull request numbers a body declares this one must merge after.
 *
 * Duplicates are dropped and the order within the declaration is not kept:
 * what is being read is a set of things that have to have happened, not a
 * sequence. A number that names no pull request, or one that is already
 * closed, simply never appears in the open list and so constrains nothing.
 */
export const parseMergeAfter = (body: string): readonly number[] =>
  Arr.uniq(
    outsideCodeFences(body)
      .matchAll(MERGE_AFTER_LINE)
      .flatMap((line) =>
        (line.groups?.['refs'] ?? '')
          .matchAll(PULL_REQUEST_REF)
          .flatMap((ref) => {
            const parsed = Num.safeParseInt(ref.groups?.['number'] ?? '');

            return Result.isOk(parsed) ? [parsed.value] : [];
          }),
      )
      .toArray(),
  );

/**
 * The body with the contents of its fenced code blocks blanked out, line
 * count preserved.
 *
 * A declaration and an example of one are the same text, and the pull request
 * that introduced this feature had to describe it: written in a fence, the
 * example would have been read as a constraint on the pull request
 * documenting it. A fence is how every document here already says "this is a
 * sample, not the thing itself", so it is the line to draw.
 *
 * Exported because `pr-report` reads the closing keywords (`Closes #12`) out
 * of the same bodies and has to draw the line in the same place — a document
 * showing what a declaration looks like must not become one.
 */
export const outsideCodeFences = (body: string): string => {
  let mut_inFence = false;

  return body
    .split('\n')
    .map((line) => {
      if (!FENCE_LINE.test(line)) {
        return mut_inFence ? '' : line;
      }

      mut_inFence = !mut_inFence;

      return '';
    })
    .join('\n');
};

/**
 * The `Merge-After` cycles, one entry per cycle, each listing the numbers in
 * the order the edges run and rotated to start at its lowest number so that
 * the same cycle is always reported the same way.
 *
 * A cycle is not a state anything here can resolve: every pull request on one
 * waits for another that waits, in the end, for it. Naming it is the whole of
 * what can be done about it — without this the members would each report
 * "waiting on #N" for as long as the loop runs, with nothing saying why that
 * never changes. A pull request that declares itself is a cycle of one, and
 * is found by the same walk.
 */
export const findMergeAfterCycles = (
  dependencies: ReadonlyMap<number, readonly number[]>,
): readonly (readonly number[])[] => {
  const mut_finished = new Set<number>();

  const mut_cycles = new Map<string, readonly number[]>();

  const visit = (node: number, walked: readonly number[]): void => {
    const at = walked.indexOf(node);

    if (at !== -1) {
      // A back edge into the path being walked: everything from there on is
      // the cycle.
      const cycle = rotateToLowest(walked.slice(at));

      mut_cycles.set(cycle.join(','), cycle);

      return;
    }

    if (mut_finished.has(node)) {
      return;
    }

    for (const dependency of dependencies.get(node) ?? []) {
      visit(dependency, Arr.toPushed(walked, node));
    }

    // Only once every edge out of it has been walked, so no back edge into
    // this node's subtree can be missed by the walk that comes next.
    mut_finished.add(node);
  };

  for (const node of dependencies.keys()) {
    visit(node, []);
  }

  return Array.from(mut_cycles.values());
};

const rotateToLowest = (cycle: readonly number[]): readonly number[] => {
  if (!Arr.isNonEmpty(cycle)) {
    return cycle;
  }

  const at = cycle.indexOf(Math.min(...cycle));

  return at <= 0 ? cycle : [...cycle.slice(at), ...cycle.slice(0, at)];
};

if (import.meta.vitest !== undefined) {
  test('rotateToLowest', () => {
    // The edges keep their order; only where the reading starts changes.
    assert.deepStrictEqual(rotateToLowest([2, 3, 1]), [1, 2, 3]);

    assert.deepStrictEqual(rotateToLowest([3, 1, 2]), [1, 2, 3]);

    assert.deepStrictEqual(rotateToLowest([1, 2, 3]), [1, 2, 3]);

    assert.deepStrictEqual(rotateToLowest([7]), [7]);

    assert.deepStrictEqual(rotateToLowest([]), []);
  });
}
