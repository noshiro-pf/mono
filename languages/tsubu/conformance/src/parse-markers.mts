/**
 * Parser for the expected-diagnostic markers described in
 * `docs/tsubu/conformance-corpus.md`:
 *
 * - `// @tsubu-expect <rule-id> ["message substring"]` applies to the next
 *   non-marker line (markers stack).
 * - `// @tsubu-expect-file <rule-id>` describes a file-wide diagnostic.
 */

export type ExpectedDiagnostic = Readonly<{
  ruleId: string;
  messageIncludes: string | undefined;
  /** 1-based line of the code the marker applies to (0 for file-scoped). */
  line: number;
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
  const mut_pending: [number, Omit<ExpectedDiagnostic, 'line'>][] = [];

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
        `line ${lineNumber}: malformed @tsubu-expect marker: ${lineText}`,
      );

      continue;
    }

    if (mut_pending.length > 0) {
      if (lineText === '') {
        mut_problems.push(
          `line ${lineNumber}: @tsubu-expect marker must be immediately followed by a code line`,
        );

        mut_pending.length = 0;

        continue;
      }

      for (const [, pending] of mut_pending) {
        mut_expected.push({ ...pending, line: lineNumber });
      }

      mut_pending.length = 0;
    }
  }

  for (const [markerLine] of mut_pending) {
    mut_problems.push(
      `line ${markerLine}: @tsubu-expect marker at end of file applies to nothing`,
    );
  }

  return { expected: mut_expected, problems: mut_problems };
};

export const hasMarkerLikeComment = (sourceText: string): boolean =>
  sourceText
    .split('\n')
    .some((line) => line.trimStart().startsWith(markerPrefix));

const markerPrefix = '// @tsubu-expect';

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
