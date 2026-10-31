import type { CheckerDiagnostic } from '@sumi-lang/checker';
import {
  findSumiSilencingDirectives,
  parseMarkers,
  toRuleId,
  type OxlintDiagnostic,
} from '@sumi-lang/oxlint-config';
import * as fs from 'node:fs';
import { Arr } from 'ts-data-forge';

/**
 * A `@sumi-expect-error` marker that no diagnostic answered.
 *
 * This is the half of the directive that makes it worth having. A comment that
 * only silences a diagnostic rots in place once the code around it is fixed;
 * one that fails when the diagnostic stops appearing cannot (`@ts-expect-error`
 * is the same bargain, and D-51 chose the spelling to make the resemblance the
 * point).
 */
export type UnusedExpectError = Readonly<{
  filename: string;
  /** 1-based line of the marker itself. */
  line: number;
  ruleId: string;

  /** `@sumi-expect-error-file`, which answers for the file, not one line. */
  fileScoped: boolean;
}>;

/**
 * A comment that starts like a marker but is not one: malformed, applying to
 * nothing, or a `@sumi-expect-error-file` below code (D-63). It suppresses
 * nothing, so without this report the diagnostic it meant would come back with
 * no word about why.
 */
export type InvalidExpectError = Readonly<{
  filename: string;
  line: number;
  message: string;
}>;

/**
 * An `oxlint-disable*` comment that silences a rule of the Sumi preset. oxlint
 * applies it before `sumi check` sees a diagnostic, and no option turns it off,
 * so the comment itself is reported: `@sumi-expect-error` is the one way to
 * answer a Sumi diagnostic (D-60).
 */
export type SilencingDirective = Readonly<{
  filename: string;
  line: number;
  message: string;
}>;

export type ExpectErrorResult = Readonly<{
  /** The oxlint diagnostics left after the matched ones were suppressed. */
  lint: readonly OxlintDiagnostic[];

  /** The checker diagnostics left after the matched ones were suppressed. */
  checker: readonly CheckerDiagnostic[];
  unused: readonly UnusedExpectError[];
  invalid: readonly InvalidExpectError[];
  silencingDirectives: readonly SilencingDirective[];
}>;

/**
 * What the marker matching needs from a diagnostic, whichever engine produced
 * it. A neutral rule ID is the whole vocabulary a marker speaks (D-51), so the
 * two engines are matched against one list.
 */
type Located = Readonly<{
  file: string;
  line: number;
  ruleId: string;
}>;

type Entry = Readonly<
  | { kind: 'lint'; diagnostic: OxlintDiagnostic; located: Located }
  | { kind: 'checker'; diagnostic: CheckerDiagnostic; located: Located }
>;

/**
 * Applies the `@sumi-expect-error` directives in `files` to both engines'
 * diagnostics, and finds the `oxlint-disable*` comments that would answer one
 * in their place.
 *
 * A marker names a neutral rule ID and applies to the next line that is neither
 * a marker nor another linter's next-line directive, exactly as it does in the
 * conformance corpus — one spelling, one meaning (D-51). A diagnostic it names
 * on that line is suppressed; a marker nothing answered comes back in `unused`
 * for the caller to report.
 *
 * Both engines are matched in one pass, because which of them produced a
 * diagnostic is not something a marker can say: the oxlint preset and the
 * type-aware checker (D-54) report into the same neutral vocabulary, and the
 * corpus merges them for that reason too. A pass per engine would report every
 * marker the other engine answered as unused.
 *
 * Only lint diagnostics are covered. A compiler error already has
 * `@ts-expect-error`, which TypeScript itself checks for staleness the same
 * way, and two comments for one job would only raise the question of which one
 * applies.
 *
 * A marker naming a rule that did fire on that line but under a different ID
 * counts as unused, and the diagnostic stands. That is deliberate: the
 * alternative — suppressing whatever happens to be there — is what makes a
 * blanket `disable` comment outlive its reason.
 */
export const applyExpectErrors = (
  files: readonly string[],
  lintDiagnostics: readonly OxlintDiagnostic[],
  checkerDiagnostics: readonly CheckerDiagnostic[],
): ExpectErrorResult => {
  const entries: readonly Entry[] = [
    ...lintDiagnostics.map((diagnostic): Entry => ({
      kind: 'lint',
      diagnostic,
      located: {
        file: diagnostic.filename,
        line: diagnostic.line,
        ruleId: toRuleId(diagnostic.code),
      },
    })),
    ...checkerDiagnostics.map((diagnostic): Entry => ({
      kind: 'checker',
      diagnostic,
      located: {
        file: diagnostic.fileName,
        line: diagnostic.line,
        ruleId: diagnostic.ruleId,
      },
    })),
  ] as const;

  const mut_byFile = new Map<string, readonly Entry[]>();

  for (const entry of entries) {
    mut_byFile.set(entry.located.file, [
      ...(mut_byFile.get(entry.located.file) ?? []),
      entry,
    ]);
  }

  const mut_suppressedLint = new Set<OxlintDiagnostic>();

  const mut_suppressedChecker = new Set<CheckerDiagnostic>();

  const mut_unused: UnusedExpectError[] = [];

  const mut_invalid: InvalidExpectError[] = [];

  const mut_silencingDirectives: SilencingDirective[] = [];

  for (const file of files) {
    const source = readFile(file);

    if (source === undefined) {
      continue;
    }

    const { expected, problems } = parseMarkers(source);

    for (const problem of problems) {
      mut_invalid.push({ filename: file, ...problem });
    }

    for (const problem of findSumiSilencingDirectives(source)) {
      mut_silencingDirectives.push({ filename: file, ...problem });
    }

    const inFile = mut_byFile.get(file) ?? [];

    for (const marker of expected) {
      const matched = inFile.filter(
        (entry) =>
          entry.located.ruleId === marker.ruleId &&
          (marker.fileScoped || entry.located.line === marker.line),
      );

      if (Arr.isEmpty(matched)) {
        mut_unused.push({
          filename: file,
          // The marker's own line, not the code's: the two need not be
          // adjacent, and a file-scoped marker has no code line at all.
          line: marker.markerLine,
          ruleId: marker.ruleId,
          fileScoped: marker.fileScoped,
        });
      } else {
        for (const entry of matched) {
          if (entry.kind === 'lint') {
            mut_suppressedLint.add(entry.diagnostic);
          } else {
            mut_suppressedChecker.add(entry.diagnostic);
          }
        }
      }
    }
  }

  return {
    lint: lintDiagnostics.filter(
      (diagnostic) => !mut_suppressedLint.has(diagnostic),
    ),
    checker: checkerDiagnostics.filter(
      (diagnostic) => !mut_suppressedChecker.has(diagnostic),
    ),
    unused: mut_unused,
    invalid: mut_invalid,
    silencingDirectives: mut_silencingDirectives,
  };
};

const readFile = (file: string): string | undefined => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    return fs.readFileSync(file, 'utf8');
  } catch {
    // A file the program lists but that cannot be read is the type check's
    // problem to report, not this pass's.
    return undefined;
  }
};
