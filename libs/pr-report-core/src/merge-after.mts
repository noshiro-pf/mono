/**
 * The order the pull requests declare, read from `Merge-After:` trailers in
 * their bodies, and the order the issues declare, read from `Start-After:`
 * in theirs.
 */

import { Arr, Num, Result } from 'ts-data-forge';

/**
 * `#N`, and only when nothing that could end a repository name comes right
 * before the `#`: `other/repo#5` is another repository's #5, and treating it as
 * this one's would wait for a pull request the author never named.
 * `noshiro-pf/mono#5` is not read either, though it means this repository — the
 * declaration takes `#N` and nothing else, so there is one way to write it.
 */
const NUMBER_REF = /(?<![\w./-])#(?<number>\d+)\b/gu;

const DECLARATION_LINE = {
  'merge-after': /^[^\S\n]*merge-after[^\S\n]*:(?<refs>[^\n]*)$/gimu,
  'start-after': /^[^\S\n]*start-after[^\S\n]*:(?<refs>[^\n]*)$/gimu,
} as const;

/**
 * A line that can open or close a fenced code block: a run of three or more
 * backticks or tildes, and what follows it on the line.
 */
const FENCE_LINE = /^[^\S\n]*(?<marker>`{3,}|~{3,})(?<rest>[^\n]*)$/u;

/**
 * Whether `line` is one {@link parseMergeAfter} or {@link parseStartAfter} reads
 * as a declaration, whatever it names: the one pattern, for a check that guards
 * what they will read.
 */
export const isDeclarationLine = (
  line: string,
  key: 'merge-after' | 'start-after',
): boolean => Arr.isNonEmpty(Array.from(line.matchAll(DECLARATION_LINE[key])));

/**
 * The pull request numbers a body declares this one must merge after.
 *
 * Duplicates are dropped and the order within the declaration is not kept:
 * what is being read is a set of things that have to have happened, not a
 * sequence. A number that names no pull request, or one that is already closed,
 * simply never appears in the open list and so constrains nothing.
 */
export const parseMergeAfter = (body: string): readonly number[] =>
  parseDeclaration(body, 'merge-after');

/**
 * The numbers an issue body declares it waits for before it is started, read
 * exactly as {@link parseMergeAfter} reads its trailer
 * (`docs/issue-start-after.md`).
 */
export const parseStartAfter = (body: string): readonly number[] =>
  parseDeclaration(body, 'start-after');

/**
 * The body with the contents of its fenced code blocks blanked out, line count
 * preserved.
 *
 * A declaration and an example of one are the same text, and the pull request
 * that introduced this feature had to describe it: written in a fence, the
 * example would have been read as a constraint on the pull request documenting
 * it. A fence is how every document here already says "this is a sample, not
 * the thing itself", so it is the line to draw.
 *
 * Exported because `pr-report` reads the closing keywords (`Closes #12`) out of
 * the same bodies and has to draw the line in the same place — a document
 * showing what a declaration looks like must not become one.
 */
export const outsideCodeFences = (body: string): string => {
  const lines = body.split('\n');

  const inCode = codeLines(lines);

  return lines
    .map((line, i) => (inCode[i] === undefined ? line : ''))
    .join('\n');
};

/**
 * The fenced code blocks of `body`, each from its opening line through its
 * closing one (or the end of the body, for one left open), as written: the
 * lines {@link outsideCodeFences} blanks, cut where it cuts them.
 */
export const codeFenceBlocks = (body: string): readonly string[] => {
  const lines = body.split('\n');

  const inCode = codeLines(lines);

  // A block runs from its opening line up to the first line that is not code.
  return inCode.flatMap((role, start) => {
    if (role !== 'open') {
      return [];
    }

    const end = inCode.findIndex((r, i) => i > start && r !== 'code');

    return [lines.slice(start, end === -1 ? lines.length : end).join('\n')];
  });
};

/**
 * The `Merge-After` cycles, each listing the numbers in the order the edges run
 * and rotated to start at its lowest number so that the same cycle is always
 * reported the same way.
 *
 * Every number that lies on any cycle appears in at least one entry — callers
 * take `cycles.flat()` as the set of numbers on a cycle. Each entry is the
 * shortest cycle through the first number, in key order, that no earlier entry
 * covers, so a component with several loops yields one entry per loop needed to
 * cover it rather than every loop it holds.
 *
 * A cycle is not a state anything here can resolve: every pull request on one
 * waits for another that waits, in the end, for it. Naming it is the whole of
 * what can be done about it — without this the members would each report
 * "waiting on #N" for as long as the loop runs, with nothing saying why that
 * never changes. A pull request that declares itself is a cycle of one, and is
 * found by the same search.
 */
export const findMergeAfterCycles = (
  dependencies: ReadonlyMap<number, readonly number[]>,
): readonly (readonly number[])[] => {
  const mut_covered = new Set<number>();

  const mut_cycles = new Map<string, readonly number[]>();

  for (const node of dependencies.keys()) {
    if (mut_covered.has(node)) {
      continue;
    }

    // A search per node rather than one depth-first walk: a walk that skips
    // finished nodes misses a node whose only way back runs through one.
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
 * What each line is to the fences of a body: `'open'` for a line that opens
 * one, `'code'` for one inside it or closing it, `undefined` outside any.
 */
const codeLines = (
  lines: readonly string[],
): readonly ('open' | 'code' | undefined)[] => {
  // The marker that opened the fence the current line is in, if any.
  let mut_openedBy: string | undefined = undefined;

  return lines.map((line) => {
    const fence = FENCE_LINE.exec(line)?.groups;

    const marker = fence?.['marker'];

    const rest = fence?.['rest'] ?? '';

    if (mut_openedBy === undefined) {
      // A backtick fence's info string cannot hold a backtick (CommonMark),
      // so ```` ```x``` ```` is inline code, not an opening line.
      if (
        marker === undefined ||
        (marker.startsWith('`') && rest.includes('`'))
      ) {
        return undefined;
      }

      mut_openedBy = marker;

      return 'open';
    }

    // Only a run of the opening character, at least as long, with nothing
    // after it, closes the fence (CommonMark); any other fence line is part
    // of the code, so a ``` inside a ```` or ~~~ block does not end it.
    if (
      marker !== undefined &&
      marker.at(0) === mut_openedBy.at(0) &&
      marker.length >= mut_openedBy.length &&
      rest.trim() === ''
    ) {
      mut_openedBy = undefined;
    }

    return 'code';
  });
};

/**
 * `<Key>: #1901, #1903` in a body, anywhere in it, on as many lines as it
 * likes. Only this exact trailer is read — a sentence mentioning another pull
 * request is prose, and treating it as a declaration would make every
 * cross-reference a constraint.
 */
const parseDeclaration = (
  body: string,
  key: 'merge-after' | 'start-after',
): readonly number[] =>
  Arr.uniq(
    outsideCodeFences(body)
      .matchAll(DECLARATION_LINE[key])
      .flatMap((line) =>
        (line.groups?.['refs'] ?? '').matchAll(NUMBER_REF).flatMap((ref) => {
          const parsed = Num.safeParseInt(ref.groups?.['number'] ?? '');

          return Result.isOk(parsed) ? [parsed.value] : [];
        }),
      )
      .toArray(),
  );

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
 * The shortest cycle through `start`, from `start` along the edges back to the
 * node whose edge returns to it, or `undefined` when no path leads back.
 */
const shortestCycleThrough = (
  start: number,
  dependencies: ReadonlyMap<number, readonly number[]>,
): readonly number[] | undefined => {
  // Each reached node, with the node it was first reached from.
  const mut_reachedFrom = new Map<number, number>();

  // Level by level: every node in the frontier is one edge further from `start`
  // than the last, so the first edge back to `start` closes a shortest cycle.
  let mut_frontier: readonly number[] = [start];

  while (Arr.isNonEmpty(mut_frontier)) {
    const mut_nextFrontier: number[] = [];

    for (const node of mut_frontier) {
      for (const next of dependencies.get(node) ?? []) {
        if (next === start) {
          return pathFromStart(start, node, mut_reachedFrom);
        }

        if (mut_reachedFrom.has(next)) {
          continue;
        }

        mut_reachedFrom.set(next, node);

        mut_nextFrontier.push(next);
      }
    }

    mut_frontier = mut_nextFrontier;
  }

  return undefined;
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
