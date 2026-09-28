/**
 * Parser for the `@sumi-expect-error` markers:
 *
 * - `// @sumi-expect-error <rule-id> ["message substring"]` applies to the next
 *   line that is neither a marker (markers stack) nor another linter's
 *   next-line directive (`eslint-disable-next-line`,
 *   `oxlint-disable-next-line`). Skipping the directive is what lets both sit
 *   above one line: ESLint's applies to the line right after it, so the marker
 *   goes first and reaches past it to the same line.
 * - `// @sumi-expect-error-file <rule-id>` describes a file-wide diagnostic.
 *
 * One parser, two callers, because D-51 gave the marker one spelling and one
 * meaning wherever it appears — "the diagnostic must be here, and its absence
 * is itself a violation", as `@ts-expect-error` has:
 *
 * - the conformance corpus, where the markers are the expected output and are
 *   matched exactly (`languages/sumi/docs/conformance-corpus.md`);
 * - `sumi check` on user code, where a matched diagnostic is suppressed and an
 *   unmatched marker is reported.
 *
 * It lives here rather than in the corpus package because the corpus is a test
 * of the engine while `sumi check` is the product, and the product cannot
 * depend on its own test corpus.
 */

export type ExpectedDiagnostic = Readonly<{
  ruleId: string;
  messageIncludes: string | undefined;
  /** 1-based line of the code the marker applies to (0 for file-scoped). */
  line: number;

  /** 1-based line of the marker itself (0 for file-scoped). */
  markerLine: number;
  fileScoped: boolean;
}>;

export type ParsedMarkers = Readonly<{
  expected: readonly ExpectedDiagnostic[];
  /** Human-readable problems found while parsing (empty when well-formed). */
  problems: readonly string[];
}>;

export const parseMarkers = (sourceText: string): ParsedMarkers => {
  const lines = sourceText.split('\n').map((line) => line.trim());

  const mut_expected: ExpectedDiagnostic[] = [];

  const mut_problems: string[] = [];

  // Markers waiting for the next code line, as [1-based marker line, parsed].
  const mut_pending: [
    number,
    Omit<ExpectedDiagnostic, 'line' | 'markerLine'>,
  ][] = [];

  for (const [index, lineText] of lines.entries()) {
    const lineNumber = index + 1;

    const parsed = parseMarkerLine(lineText);

    if (parsed.type === 'marker') {
      if (parsed.fileScoped) {
        mut_expected.push({
          ruleId: parsed.ruleId,
          messageIncludes: parsed.messageIncludes,
          fileScoped: true,
          line: 0,
          markerLine: 0,
        });
      } else {
        mut_pending.push([
          lineNumber,
          {
            ruleId: parsed.ruleId,
            messageIncludes: parsed.messageIncludes,
            fileScoped: false,
          },
        ]);
      }

      continue;
    }

    if (parsed.type === 'malformed') {
      mut_problems.push(
        `line ${lineNumber}: malformed @sumi-expect-error marker: ${lineText}`,
      );

      continue;
    }

    if (mut_pending.length === 0) {
      continue;
    }

    if (isNextLineDirective(lineText)) {
      continue;
    }

    if (lineText === '') {
      mut_problems.push(
        `line ${lineNumber}: @sumi-expect-error marker must be immediately followed by a code line`,
      );

      mut_pending.length = 0;

      continue;
    }

    for (const [markerLine, pending] of mut_pending) {
      mut_expected.push({ ...pending, line: lineNumber, markerLine });
    }

    mut_pending.length = 0;
  }

  for (const [markerLine] of mut_pending) {
    mut_problems.push(
      `line ${markerLine}: @sumi-expect-error marker at end of file applies to nothing`,
    );
  }

  return { expected: mut_expected, problems: mut_problems };
};

export const hasMarkerLikeComment = (sourceText: string): boolean =>
  sourceText
    .split('\n')
    .some((line) => line.trimStart().startsWith(markerPrefix));

const markerPrefix = '// @sumi-expect-error';

const nextLineDirectivePrefixes = [
  '// eslint-disable-next-line',
  '/* eslint-disable-next-line',
  '// oxlint-disable-next-line',
  '/* oxlint-disable-next-line',
] as const;

/**
 * Whether `line` is another linter's directive for the line after it — the
 * one kind of comment line a marker reaches past. Any other comment is a line
 * a marker can mean: a diagnostic can sit on the comment itself (`// @ts-ignore`
 * is one).
 */
const isNextLineDirective = (line: string): boolean =>
  nextLineDirectivePrefixes.some((prefix) => line.startsWith(prefix));

type ParsedMarkerLine = Readonly<
  | {
      type: 'marker';
      fileScoped: boolean;
      ruleId: string;
      messageIncludes: string | undefined;
    }
  | { type: 'malformed' }
  | { type: 'not-marker' }
>;

// Kept trivially linear on purpose (security/detect-unsafe-regex rejects the
// single-regex form of this grammar).
const ruleIdRegex = /^[a-z0-9-]+\/[a-z0-9-]+$/u;

const parseMarkerLine = (line: string): ParsedMarkerLine => {
  if (!line.startsWith(markerPrefix)) {
    return { type: 'not-marker' };
  }

  const afterPrefix = line.slice(markerPrefix.length);

  const fileScoped = afterPrefix.startsWith('-file');

  const afterKeyword = fileScoped
    ? afterPrefix.slice('-file'.length)
    : afterPrefix;

  if (!afterKeyword.startsWith(' ')) {
    return { type: 'malformed' };
  }

  const body = afterKeyword.slice(1);

  const spaceIndex = body.indexOf(' ');

  const ruleId = spaceIndex === -1 ? body : body.slice(0, spaceIndex);

  if (!ruleIdRegex.test(ruleId)) {
    return { type: 'malformed' };
  }

  const rest = spaceIndex === -1 ? '' : body.slice(spaceIndex + 1);

  if (rest === '') {
    return { type: 'marker', fileScoped, ruleId, messageIncludes: undefined };
  }

  if (rest.length > 2 && rest.startsWith('"') && rest.endsWith('"')) {
    return {
      type: 'marker',
      fileScoped,
      ruleId,
      messageIncludes: rest.slice(1, -1),
    };
  }

  return { type: 'malformed' };
};
