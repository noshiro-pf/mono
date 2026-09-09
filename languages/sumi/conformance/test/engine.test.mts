import {
  allRules,
  implementedRuleIds as checkerRuleIds,
  runRules,
} from '@sumi-lang/checker';
import {
  implementedRuleIds as oxlintRuleIds,
  parseMarkers,
  runOxlint,
  toRuleId,
  type ExpectedDiagnostic,
  type OxlintDiagnostic,
} from '@sumi-lang/oxlint-config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { fixturesRootPath, listFixtures } from '../src/index.mjs';

/**
 * The engine check: both engines run over the whole corpus, their diagnostics
 * normalized to neutral rule IDs, and compared with the `@sumi-expect-error`
 * markers — exact match both ways (languages/sumi/docs/conformance-corpus.md,
 * "runner の契約").
 *
 * Two engines because a rule needs one or the other, never both: the oxlint
 * preset (@sumi-lang/oxlint-config) for what syntax settles, and the Sumi
 * checker (@sumi-lang/checker, D-55) on TypeScript 7's own API for what needs
 * the type checker. The corpus does not care which produced a diagnostic —
 * that is the point of the neutral IDs — so the two lists are merged before
 * anything is compared.
 */

/**
 * Neutral IDs that have fixtures but no implementation in either engine yet
 * (fixtures are written first — TDD for 🆕 rules). Listed explicitly, like an
 * `@ts-expect-error`: an entry whose rule becomes implemented fails the
 * "still unimplemented" check below and has to be removed.
 */
const knownUnimplementedRuleIds: ReadonlySet<string> = new Set();

const implementedRuleIds: ReadonlySet<string> =
  oxlintRuleIds.union(checkerRuleIds);

const fixtures = listFixtures(fixturesRootPath).fixtures;

// One oxlint process for the whole corpus: startup (JS plugin load, tsgolint)
// dominates per-file cost.
const run = runOxlint(fixtures.map((fixture) => fixture.absolutePath));

// One program for the whole corpus, for the same reason.
const fixturePaths: ReadonlySet<string> = new Set(
  fixtures.map((fixture) => fixture.absolutePath),
);

const oxlintDiagnosticsByFile: ReadonlyMap<
  string,
  readonly OxlintDiagnostic[]
> = Map.groupBy(run.diagnostics, (diagnostic) => diagnostic.filename);

const checkerRun = runRules(
  path.resolve(fixturesRootPath, 'tsconfig.json'),
  allRules,
  (fileName) => fixturePaths.has(fileName),
);

type Observed = Readonly<{
  ruleId: string;
  line: number;
  message: string;
}>;

const toObserved = (diagnostic: OxlintDiagnostic): Observed =>
  ({
    ruleId: toRuleId(diagnostic.code),
    line: diagnostic.line,
    message: diagnostic.message,
  }) as const;

/**
 * Both engines' diagnostics for one file. Which engine found a problem is not
 * part of the corpus's contract, so the lists are concatenated and compared as
 * one multiset.
 */
const observedByFile: ReadonlyMap<string, readonly Observed[]> = new Map(
  fixtures.map((fixture) => [
    fixture.absolutePath,
    [
      ...(oxlintDiagnosticsByFile.get(fixture.absolutePath) ?? []).map(
        toObserved,
      ),
      ...(Result.isOk(checkerRun) ? checkerRun.value : [])
        .filter((d) => d.fileName === fixture.absolutePath)
        .map((d): Observed => ({
          ruleId: d.ruleId,
          line: d.line,
          message: d.message,
        })),
    ],
  ]),
);

const key = (ruleId: string, line: number): string =>
  `${line}:${ruleId}` as const;

const fixtureCases = fixtures.map((fixture) => {
  const ruleId: string = `${fixture.area}/${fixture.rule}` as const;

  return {
    label: `${ruleId}/${fixture.kind}/${fixture.fileName}`,
    ruleId,
    observed: observedByFile.get(fixture.absolutePath) ?? [],
    expected: parseMarkers(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(fixture.absolutePath, 'utf8'),
    ).expected,
  };
});

const implementedCases = fixtureCases.filter((c) =>
  implementedRuleIds.has(c.ruleId),
);

describe('engines', () => {
  test('the Sumi checker opened the corpus project', () => {
    // A checker that failed to start reports nothing, which would make every
    // type-aware fixture fail confusingly, so it is asserted first.
    assert.isTrue(Result.isOk(checkerRun));
  });

  test('oxlint ran without loader or type-aware failures', () => {
    // A failed JS-plugin load or a missing tsgolint prints to stderr and
    // yields no diagnostics at all — which would make every invalid fixture
    // fail confusingly, so it is asserted first.
    assert.deepStrictEqual(
      run.stderr.replaceAll(/^warning:.*$/gmu, '').trim(),
      '',
    );
  });

  test('every diagnostic code produced by the preset is mapped to a neutral ID', () => {
    const unmapped = Array.from(
      new Set(
        run.diagnostics
          .map((d) => toRuleId(d.code))
          .filter((ruleId) => ruleId.startsWith('unmapped:')),
      ),
    ).toSorted();

    assert.deepStrictEqual(unmapped, []);
  });

  test('every mapped neutral ID has at least one fixture', () => {
    const fixtureRuleIds = new Set(fixtureCases.map((c) => c.ruleId));

    const withoutFixture = Array.from(implementedRuleIds)
      .filter((ruleId) => !fixtureRuleIds.has(ruleId))
      .toSorted();

    assert.deepStrictEqual(withoutFixture, []);
  });

  test('the fixtures without an oxlint implementation are exactly the known ones', () => {
    const unimplemented = Array.from(
      new Set(
        fixtureCases
          .filter((c) => !implementedRuleIds.has(c.ruleId))
          .map((c) => c.ruleId),
      ),
    ).toSorted();

    assert.deepStrictEqual(
      unimplemented,
      Array.from(knownUnimplementedRuleIds).toSorted(),
    );
  });

  describe.each(implementedCases)('$label', ({ observed, expected }) => {
    test('diagnostics match the markers exactly', () => {
      // Line-scoped markers must match a diagnostic on that line; file-scoped
      // ones match any line. Compared as multisets of `line:ruleId`.
      const expectedKeys = expected
        .map((e) =>
          e.fileScoped
            ? key(
                e.ruleId,
                observed.find((o) => o.ruleId === e.ruleId)?.line ?? 0,
              )
            : key(e.ruleId, e.line),
        )
        .toSorted();

      const observedKeys = observed
        .map((o) => key(o.ruleId, o.line))
        .toSorted();

      assert.deepStrictEqual(observedKeys, expectedKeys);
    });

    test('message substrings named by markers appear in the diagnostics', () => {
      const unmatched = expected
        .filter((e: ExpectedDiagnostic) => e.messageIncludes !== undefined)
        .filter((e) =>
          observed.every(
            (o) =>
              !(
                o.ruleId === e.ruleId &&
                (e.fileScoped || o.line === e.line) &&
                o.message.includes(e.messageIncludes ?? '')
              ),
          ),
        )
        .map((e) => `${e.ruleId}@${e.line}: "${e.messageIncludes}"`);

      assert.deepStrictEqual(unmatched, []);
    });
  });
});
