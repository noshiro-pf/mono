import * as fs from 'node:fs';
import {
  implementedRuleIds,
  oxlintCodeToRuleId,
  runOxlint,
  type OxlintDiagnostic,
} from 'sumi-oxlint-config';
import {
  fixturesRootPath,
  listFixtures,
  parseMarkers,
  type ExpectedDiagnostic,
} from '../src/index.mjs';

/**
 * Phase 1 engine check: the oxlint preset (sumi-oxlint-config) run over the
 * whole corpus, its diagnostics normalized to neutral rule IDs through the
 * preset's mapping, and compared with the `@sumi-expect` markers — exact
 * match both ways (docs/sumi/conformance-corpus.md, "runner の契約").
 */

/**
 * Neutral IDs that have fixtures but no oxlint implementation yet (fixtures
 * are written first — TDD for 🆕 rules). Listed explicitly, like an
 * `@ts-expect-error`: an entry whose rule becomes implemented fails the
 * "still unimplemented" check below and has to be removed.
 */
const knownUnimplementedRuleIds: ReadonlySet<string> = new Set();

const fixtures = listFixtures(fixturesRootPath).fixtures;

// One oxlint process for the whole corpus: startup (JS plugin load, tsgolint)
// dominates per-file cost.
const run = runOxlint(fixtures.map((fixture) => fixture.absolutePath));

const diagnosticsByFile: ReadonlyMap<string, readonly OxlintDiagnostic[]> =
  Map.groupBy(run.diagnostics, (diagnostic) => diagnostic.filename);

type Observed = Readonly<{
  ruleId: string;
  line: number;
  message: string;
}>;

const toObserved = (diagnostic: OxlintDiagnostic): Observed => ({
  ruleId:
    oxlintCodeToRuleId.get(diagnostic.code) ?? `unmapped:${diagnostic.code}`,
  line: diagnostic.line,
  message: diagnostic.message,
});

const key = (ruleId: string, line: number): string => `${line}:${ruleId}`;

const fixtureCases = fixtures.map((fixture) => {
  const ruleId = `${fixture.area}/${fixture.rule}`;

  return {
    label: `${ruleId}/${fixture.kind}/${fixture.fileName}`,
    ruleId,
    observed: (diagnosticsByFile.get(fixture.absolutePath) ?? []).map(
      toObserved,
    ),
    expected: parseMarkers(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(fixture.absolutePath, 'utf8'),
    ).expected,
  };
});

const implementedCases = fixtureCases.filter((c) =>
  implementedRuleIds.has(c.ruleId),
);

describe('oxlint engine', () => {
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
          .filter((d) => !oxlintCodeToRuleId.has(d.code))
          .map((d) => d.code),
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
