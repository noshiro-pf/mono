import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { $, isDirectlyExecuted } from 'ts-repo-utils';
import { type FixedLengthTuple } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when Japanese prose encloses Japanese text in halfwidth parentheses
 * `()` where the fullwidth pair `（）` is what the text calls for.
 *
 * Japanese has no interword space, so a halfwidth `(` sits flush against the
 * character before it and a fullwidth one carries its own half-width of side
 * bearing. Mixing the two inside one document is the sort of difference that
 * is invisible while writing a line and obvious once the lines sit next to
 * each other — and it is not a thing a person reliably notices in review,
 * which is why it is asked of the whole repository here rather than left to
 * the author.
 *
 * What it asks is deliberately narrow, so that the answer is never a judgement
 * call: a pair is reported only when the text it encloses *is itself
 * Japanese* and the pair is *adjacent to Japanese* — the character before `(`,
 * or the one after `)` with at most one space skipped. `Num.div(a, b)`,
 * `toHaveText('合計')` and `(TS 7)` are therefore all left alone, the first two
 * because nothing Japanese touches the parentheses and the third because the
 * text inside them is not Japanese. Parentheses around a purely Latin run are
 * a matter of house style that this check has no opinion about.
 *
 * A space on the left is deliberately *not* skipped, though one on the right
 * is. What follows a parenthetical is the sentence carrying on, so Japanese
 * there says the sentence is Japanese; what precedes one says much less.
 * `確定 (independent of any pending 提案).` is an English sentence with
 * Japanese terms in it, and `// "9月4日 (土)" 15` is a sample of a quoted input
 * that has to stay byte for byte — both would read back as Japanese prose if
 * the character before the space counted.
 *
 * Three things are never read, because in each of them the parentheses are
 * syntax rather than punctuation:
 *
 * - fenced code blocks in Markdown,
 * - inline code spans (an odd number of backticks earlier on the line),
 * - a Markdown link or image destination, where `(` follows `]` directly.
 *
 * A pair split across two lines is not read either: the scan is line by line,
 * and a pair that wraps is rare enough that looking for it would cost more in
 * false positives than it finds.
 */
export const checkJapaneseParentheses = async (
  options: Readonly<{ fix?: boolean }> = {},
): Promise<Result<CheckSummary, string>> => {
  const { fix = false } = options;

  const filesResult = await collectScannedFiles();

  if (Result.isErr(filesResult)) {
    return Result.err(filesResult.value);
  }

  const files = filesResult.value;

  const results = await Promise.all(
    files.map(async (relativePath) => visitFile(relativePath, fix)),
  );

  const firstError = results.find(Result.isErr);

  if (firstError !== undefined) {
    return Result.err(firstError.value);
  }

  const visited = results.flatMap((result) =>
    Result.isErr(result) ? [] : [result.value],
  );

  const offending = visited.filter(({ violations }) =>
    Arr.isNonEmpty(violations),
  );

  const total = offending.reduce(
    (count, { violations }) => count + violations.length,
    0,
  );

  if (fix || !Arr.isNonEmpty(offending)) {
    return Result.ok({ files: files.length, fixed: fix ? total : 0, total });
  }

  return Result.err(formatViolations(offending));
};

/**
 * Every halfwidth pair in `fileText` that the rule above asks to be fullwidth,
 * in the order they are read.
 *
 * `markdown` decides whether fenced code blocks are skipped. It is off for a
 * `.mts` or a `.yml`, where a line opening with three backticks is far more
 * likely to be prose inside a comment than a fence — and where the adjacency
 * rule already keeps the scan away from code.
 */
export const findHalfwidthParentheses = (
  fileText: string,
  options: Readonly<{ markdown?: boolean }> = {},
): readonly ParenthesisViolation[] => {
  const { markdown = false } = options;

  const lines = fileText.split('\n');

  const mut_violations: ParenthesisViolation[] = [];

  // The run of backticks or tildes that opened the fenced block being skipped,
  // or `undefined` while the scan is in prose.
  let mut_openFence: string | undefined = undefined;

  for (const [index, line] of lines.entries()) {
    if (markdown) {
      const marker = fenceMarkerOf(line);

      if (mut_openFence !== undefined) {
        if (marker !== undefined && closesFence(mut_openFence, marker)) {
          mut_openFence = undefined;
        }

        continue;
      }

      if (marker !== undefined) {
        mut_openFence = marker;

        continue;
      }
    }

    mut_violations.push(...scanLine(line, index + 1));
  }

  return mut_violations;
};

/**
 * `fileText` with every pair {@link findHalfwidthParentheses} reports written
 * fullwidth.
 *
 * The spaces the halfwidth pair needed go with it. A halfwidth `(` is set
 * flush against the character before it, so Japanese prose writes a space to
 * keep the line breathing; a fullwidth `（` carries that space inside the
 * glyph, and leaving the written one behind sets a space and a half —
 * `コマンド （…）` rather than `コマンド（…）`. So one space immediately inside
 * the pair goes, as does one immediately before it that is not the line's
 * indentation, and one immediately after it that Japanese follows. A space
 * between `）` and a Latin word stays: that is the word's own.
 *
 * The pairs on a line are rewritten right to left, because dropping those
 * spaces shortens the line and would otherwise move the pairs found after
 * them. The whole pass repeats until the text stops changing, which is what
 * carries a nested pair: `(あ(い)う)` is reported as `(い)` on the first pass
 * and as the outer pair on the second.
 */
export const toFullwidthParentheses = (
  fileText: string,
  options: Readonly<{ markdown?: boolean }> = {},
): string => {
  const rewriteOnce = (text: string): string => {
    const violations = findHalfwidthParentheses(text, options);

    if (!Arr.isNonEmpty(violations)) return text;

    const lines = text.split('\n');

    const byLine = Map.groupBy(violations, ({ line }) => line);

    return lines
      .map((line, index) => {
        const onThisLine = byLine.get(index + 1);

        return onThisLine === undefined
          ? line
          : onThisLine
              .toSorted((a, b) => b.column - a.column)
              .reduce(rewritePair, line);
      })
      .join('\n');
  };

  const rewriteUntilStable = (text: string, passesLeft: number): string => {
    if (passesLeft <= 0) return text;

    const rewritten = rewriteOnce(text);

    return rewritten === text
      ? text
      : rewriteUntilStable(rewritten, passesLeft - 1);
  };

  return rewriteUntilStable(fileText, MAX_REWRITE_PASSES);
};

export type ParenthesisViolation = Readonly<{
  /** 1-based. */
  line: number;
  /** 1-based, at the `(`. */
  column: number;
  /** The pair and everything between it, `(` and `)` included. */
  matched: string;
  lineText: string;
}>;

type VisitedFile = Readonly<{
  relativePath: string;
  violations: readonly ParenthesisViolation[];
}>;

type CheckSummary = Readonly<{
  files: number;
  fixed: number;
  total: number;
}>;

/**
 * The Japanese characters, for both halves of the rule: the CJK punctuation
 * block (`、`, `。`, `「」`, `〜`, …), the kana, the CJK ideographs and their
 * first extension, and the fullwidth forms (`（`, `）`, `：`, `？`, …). A
 * fullwidth parenthesis counts as Japanese here on purpose — it is what makes
 * `（あ）(い)` report its second pair.
 *
 * Written as code point ranges rather than as one character class, which
 * `security/detect-unsafe-regex` rejects and which reads, at this width, as a
 * wall of escapes with no way to see where one block ends.
 */
const JAPANESE_RANGES: readonly FixedLengthTuple<2, number>[] = [
  [0x30_00, 0x30_3f],
  [0x30_40, 0x30_9f],
  [0x30_a0, 0x30_ff],
  [0x34_00, 0x4d_bf],
  [0x4e_00, 0x9f_ff],
  [0xff_01, 0xff_60],
];

const isJapanese = (character: string): boolean => {
  const codePoint = character.codePointAt(0);

  return (
    codePoint !== undefined &&
    JAPANESE_RANGES.some(
      ([first, last]) => first <= codePoint && codePoint <= last,
    )
  );
};

const containsJapanese = (text: string): boolean =>
  Array.from(text).some(isJapanese);

/** A halfwidth pair with no parenthesis and no line break inside it. */
const HALFWIDTH_PAIR = /\((?<inner>[^()\n]*)\)/gu;

/** An opening or closing fence: three or more backticks or tildes. */
const FENCE_MARKER = /^\s{0,3}(?<marker>`{3,}|~{3,})/u;

/**
 * Two passes carry a pair nested one deep, which is as deep as anything here
 * goes; the third is what proves the text has stopped changing.
 */
const MAX_REWRITE_PASSES = 3;

/** The extensions worth reading. Everything else is binary or generated. */
const SCANNED_EXTENSIONS: ReadonlySet<string> = new Set([
  '.css',
  '.cts',
  '.html',
  '.js',
  '.json',
  '.jsonc',
  '.jsx',
  '.md',
  '.mdx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const MARKDOWN_EXTENSIONS: ReadonlySet<string> = new Set(['.md', '.mdx']);

/**
 * Paths whose text is not ours to punctuate.
 *
 * `experimental/` is the pre-2026 monorepo, outside every other tool's globs
 * too. The three under `docs/` are verbatim copies of documents received as
 * they are — the Japanese translations of the Rust and TypeScript books, and
 * the IETF RFCs — and editing one would make it no longer a copy, which is why
 * `docs/json-spec/` is excluded from cspell for the same reason. The
 * per-version directories under `strict-lib/` are the generated standard
 * library and the diffs taken over it.
 */
const IGNORED_PREFIXES: readonly string[] = [
  'docs/json-spec/',
  'docs/rust_book/',
  'docs/typescript_book/',
  'experimental/',
];

const IGNORED_PATTERN = /^strict-lib\/v[\d.]+\//u;

const isScanned = (relativePath: string): boolean =>
  SCANNED_EXTENSIONS.has(path.extname(relativePath)) &&
  IGNORED_PREFIXES.every((prefix) => !relativePath.startsWith(prefix)) &&
  !IGNORED_PATTERN.test(relativePath);

const fenceMarkerOf = (line: string): string | undefined =>
  FENCE_MARKER.exec(line)?.groups?.['marker'];

/**
 * A fence closes on a run of the same character at least as long as the one
 * that opened it — the rule CommonMark states, and the reason a sample
 * containing a fence is written with four backticks around it.
 */
const closesFence = (openFence: string, marker: string): boolean =>
  marker.startsWith(openFence.slice(0, 1)) && marker.length >= openFence.length;

const scanLine = (
  line: string,
  lineNumber: number,
): readonly ParenthesisViolation[] =>
  Array.from(line.matchAll(HALFWIDTH_PAIR)).flatMap((matched) => {
    const column = matched.index;

    const pair = matched[0];

    const inner = matched.groups?.['inner'] ?? '';

    return enclosesJapaneseProse(line, column, pair, inner)
      ? [
          {
            line: lineNumber,
            column: column + 1,
            matched: pair,
            lineText: line,
          },
        ]
      : [];
  });

const enclosesJapaneseProse = (
  line: string,
  index: number,
  pair: string,
  inner: string,
): boolean => {
  if (!containsJapanese(inner)) return false;

  const before = line.slice(0, index);

  // A Markdown link or image destination: the parentheses hold a URL, and a
  // Japanese anchor (`](#日本語の見出し)`) is a Japanese string that must stay
  // exactly as the heading spells it.
  if (before.endsWith(']')) return false;

  // An inline code span. Counting backticks is enough because a span does not
  // survive a line break, so an odd count before the `(` means the scan is
  // inside one.
  if ((before.match(/`/gu) ?? []).length % 2 === 1) return false;

  const after = line.slice(index + pair.length);

  const previous = Array.from(before).at(-1) ?? '';

  // One space after the pair is skipped over, and one before it is not.
  // Japanese prose sets a halfwidth pair off with exactly that space, so
  // `標準 lib (… など) を厳格化` is the same sentence as `…(… など)を厳格化`
  // and what follows the parenthetical is the sentence carrying on in
  // Japanese. A space on the *left* says much less: `確定 (independent of any
  // pending 提案).` and `"9月4日 (土)" 15` are an English sentence and a
  // sample of a quoted input, and both would read back as Japanese prose if
  // the character before the space were enough. Two spaces are alignment — a
  // Markdown table, a column of comments — and are not read as prose either,
  // which a single skip gives for nothing.
  const next =
    Array.from(after.startsWith(' ') ? after.slice(1) : after)[0] ?? '';

  return isJapanese(previous) || isJapanese(next);
};

const rewritePair = (line: string, violation: ParenthesisViolation): string => {
  const start = violation.column - 1;

  const end = start + violation.matched.length - 1;

  const before = line.slice(0, start);

  const inner = line.slice(start + 1, end);

  const after = line.slice(end + 1);

  return [
    // Indentation is not the space the parenthesis brought with it.
    before.endsWith(' ') && before.trim() !== '' ? before.slice(0, -1) : before,
    '（',
    trimOneSpace(inner),
    '）',
    // Outside the closing parenthesis a space is only the pair's own where
    // Japanese follows it; between `）` and a Latin word it is the space that
    // word needs.
    after.startsWith(' ') && isJapanese(after.slice(1, 2))
      ? after.slice(1)
      : after,
  ].join('');
};

const trimOneSpace = (inner: string): string => {
  const withoutLeading = inner.startsWith(' ') ? inner.slice(1) : inner;

  return withoutLeading.endsWith(' ')
    ? withoutLeading.slice(0, -1)
    : withoutLeading;
};

/**
 * The tracked files worth reading, asked of git rather than of a glob: the
 * generated TypeDoc under a package's `docs/` and the build output under
 * `dist/` are untracked, so a checkout that has run `ws:doc` and one that has
 * not give this check the same answer.
 */
const collectScannedFiles = async (): Promise<
  Result<readonly string[], string>
> => {
  const result = await $('git ls-files -z', {
    cwd: projectRootPath,
    silent: true,
    // The repository tracks well over ten thousand files, which is more than
    // the 1 MiB `exec` defaults to.
    maxBuffer: 64 * 1024 * 1024,
  });

  if (Result.isErr(result)) {
    return Result.err(
      `Failed to list the tracked files: ${unknownToString(result.value)}`,
    );
  }

  return Result.ok(
    result.value.stdout.split('\0').filter(isScanned).toSorted(),
  );
};

const visitFile = async (
  relativePath: string,
  fix: boolean,
): Promise<Result<VisitedFile, string>> => {
  const absolutePath = path.resolve(projectRootPath, relativePath);

  const readResult = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(absolutePath, 'utf8'),
  );

  if (Result.isErr(readResult)) {
    return Result.err(
      `Failed to read ${relativePath}: ${unknownToString(readResult.value)}`,
    );
  }

  const fileText = readResult.value;

  const options = {
    markdown: MARKDOWN_EXTENSIONS.has(path.extname(relativePath)),
  } as const;

  const violations = findHalfwidthParentheses(fileText, options);

  if (!fix || !Arr.isNonEmpty(violations)) {
    return Result.ok({ relativePath, violations });
  }

  const writeResult = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFile(absolutePath, toFullwidthParentheses(fileText, options)),
  );

  return Result.isErr(writeResult)
    ? Result.err(
        `Failed to write ${relativePath}: ${unknownToString(writeResult.value)}`,
      )
    : Result.ok({ relativePath, violations });
};

const formatViolations = (offending: readonly VisitedFile[]): string => {
  const total = offending.reduce(
    (count, { violations }) => count + violations.length,
    0,
  );

  return [
    `❌ ${total} halfwidth parenthesis pair(s) enclose Japanese text in`,
    '   Japanese prose, where `（）` is what the text calls for:',
    '',
    ...offending.flatMap(({ relativePath, violations }) =>
      violations.map(
        ({ line, column, matched }) =>
          `  ${relativePath}:${line}:${column}  ${matched}`,
      ),
    ),
    '',
    'Run `pnpm run fix:japanese-parentheses` to rewrite them, or see CLAUDE.md,',
    '"Japanese text" — a pair around a purely Latin run is not asked about.',
  ].join('\n');
};

if (isDirectlyExecuted(import.meta.url)) {
  const fix = process.argv.includes('--fix');

  const result = await checkJapaneseParentheses({ fix }).catch(
    (error: unknown) => Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    fix
      ? `Rewrote ${result.value.fixed} parenthesis pair(s) across ${result.value.files} files.`
      : `Japanese prose encloses Japanese text in \`（）\` (${result.value.files} files read).`,
  );
}
