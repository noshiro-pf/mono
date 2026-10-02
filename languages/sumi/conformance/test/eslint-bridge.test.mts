import { eslintRulesByRuleId } from '@sumi-lang/cli';
import { parseMarkers } from '@sumi-lang/oxlint-config';
import { ESLint } from 'eslint';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fixturesRootPath, listFixtures } from '../src/index.mjs';

/**
 * The bridge check: the ESLint preset (@sumi-lang/eslint-config, the bridge
 * engine since D-43) runs over the whole corpus, and what it reports is
 * compared with the `@sumi-expect-error` markers — the equivalence gate
 * languages/sumi/docs/conformance-corpus.md asks for while more than one
 * engine is live.
 *
 * Narrower than the engine check (`engine.test.mts`) in two ways, both
 * because the bridge is a different preset rather than a second
 * implementation of the same one:
 *
 * - Only the neutral IDs the bridge has ESLint rules for are compared, and
 *   only diagnostics of those rules count. eslint-config-typed carries
 *   hundreds of rules the language does not define (style, React, …), and
 *   the fixtures are not written to satisfy them.
 * - Diagnostics are compared per line as sets, not multisets: one finding is
 *   routinely reported by two rules at once (`eqeqeq` and `no-eq-null`).
 *
 * Which ESLint rules stand for which neutral ID is @sumi-lang/cli's
 * `eslintRulesByRuleId`, the table `sumi check` uses to switch those rules
 * off. Reading the same table is the point: it claims that the rules it lists
 * do the whole job of the ID, and this is where that claim is tested.
 */

const adjacentOverloadLineDivergence =
  '@typescript-eslint/adjacent-overload-signatures reports the signature that is out of place; the oxlint rule reports the first signature of the set, where the marker is.';

const templateShorthandDivergence =
  'The preset sets no-implicit-coercion `disallowTemplateShorthand: true`, so a template literal holding a single expression is reported; spec/banned-syntax.md names the template literal as the replacement for `String()`, and the oxlint preset does not report it.';

/**
 * Fixtures on which the bridge does not agree with the markers, and why.
 * Listed explicitly, like an `@ts-expect-error`: an entry that starts agreeing
 * fails "still diverges" below and has to be removed.
 */
const knownDivergences: ReadonlyMap<string, string> = new Map([
  [
    'banned-syntax/no-arguments/invalid/arguments-object.mts',
    'prefer-arrow-functions leaves alone a `function` that uses `arguments`, which an arrow cannot replace; only func-names reports it, and that rule is not mapped.',
  ],
  [
    'banned-syntax/no-this/invalid/this-in-function.mts',
    'prefer-arrow-functions leaves alone a `function` that uses `this`, which an arrow cannot replace; only func-names and object-shorthand report it, and neither is mapped.',
  ],
  [
    'banned-syntax/no-bare-number-globals/invalid/bare-globals.mts',
    'unicorn/prefer-number-properties reports none of the three; `Infinity` and `parseInt` are caught by no-restricted-globals and ts-data-forge/prefer-num-safe-parse-int, whose job is wider than the ID and which are therefore not mapped, and bare `NaN` by nothing.',
  ],
  [
    'banned-syntax/no-global-type-shadow/invalid/library-type-names.mts',
    'Reported, but as @typescript-eslint/no-shadow (builtinGlobals), which maps to mutation/no-shadow; the bridge has no rule of its own for the ID.',
  ],
  [
    'exceptions/no-try/invalid/try-catch.mts',
    'functional/no-try-statements is off in eslint-config-typed and the preset does not turn it on until the try..catch proposal is settled.',
  ],
  [
    'functions/adjacent-overload-signatures/invalid/separated-declarations.mts',
    adjacentOverloadLineDivergence,
  ],
  [
    'functions/adjacent-overload-signatures/invalid/separated-overloads.mts',
    adjacentOverloadLineDivergence,
  ],
  [
    'functions/no-call-signature-member/invalid/call-signature-members.mts',
    '@typescript-eslint/prefer-function-type reports only a type whose sole member is a call or construct signature; an overload set, or a signature next to a property, is not reported.',
  ],
  [
    'functions/no-overloaded-function-expression/invalid/typed-against-overloads.mts',
    templateShorthandDivergence,
  ],
  [
    'functions/unified-signatures/invalid/unifiable-overloads.mts',
    templateShorthandDivergence,
  ],
  [
    'functions/unified-signatures/valid/return-type-varies.mts',
    templateShorthandDivergence,
  ],
  [
    'modules/no-index-file-import/valid/own-directory-index.mts',
    "no-restricted-imports bans every `index.mjs` specifier, including a file re-exporting its own directory's index, which the ID allows.",
  ],
  [
    'modules/no-namespace-object-use/invalid/namespace-as-value.mts',
    "tree-shakable/import-star does not report a computed member access (`ns['helper']`).",
  ],
  [
    'modules/no-triple-slash/invalid/reference-types.mts',
    'eslint-config-typed configures @typescript-eslint/triple-slash-reference with `types: "always"`, so `/// <reference types>` is allowed.',
  ],
  [
    'modules/require-extension/invalid/missing-extension.mts',
    'eslint-config-typed configures import-x/extensions as `never` (`mjs` / `json` always), which does not require an extension on a relative import.',
  ],
  [
    'mutation/no-let-without-mut-prefix/valid/destructuring.mts',
    "functional/no-let's ignoreIdentifierPattern does not apply to the names bound by a destructuring `let`, so `mut_`-prefixed ones are reported.",
  ],
]);

const packageRootPath = path.resolve(import.meta.dirname, '..');

const neutralIdByEslintRule: ReadonlyMap<string, string> = new Map(
  Array.from(eslintRulesByRuleId).flatMap(([ruleId, eslintRules]) =>
    eslintRules.map((eslintRule) => [eslintRule, ruleId] as const),
  ),
);

const comparedRuleIds: ReadonlySet<string> = new Set(
  neutralIdByEslintRule.values(),
);

const fixtures = listFixtures(fixturesRootPath).fixtures;

const eslint = new ESLint({
  cwd: packageRootPath,
  // Only the preset under test: the package's own eslint.config.mts ignores
  // the fixtures, which is right for linting the package and wrong here.
  overrideConfigFile: path.resolve(
    packageRootPath,
    'configs/eslint-bridge.config.mts',
  ),
  ignore: false,
});

// One run for the whole corpus: the typed-linting program dominates the cost.
const results = await eslint.lintFiles(
  fixtures.map((fixture) => fixture.absolutePath),
);

const resultByFile: ReadonlyMap<string, ESLint.LintResult> = new Map(
  results.map((result) => [result.filePath, result]),
);

const key = (ruleId: string, line: number): string =>
  `${line}:${ruleId}` as const;

const toSortedSet = (keys: readonly string[]): readonly string[] =>
  Array.from(new Set(keys)).toSorted();

const fixtureCases = fixtures.map((fixture) => {
  const label = path.relative(fixturesRootPath, fixture.absolutePath);

  const observed = (
    resultByFile.get(fixture.absolutePath)?.messages ?? []
  ).flatMap((message) => {
    const ruleId =
      message.ruleId === null
        ? undefined
        : neutralIdByEslintRule.get(message.ruleId);

    return ruleId === undefined ? [] : [{ ruleId, line: message.line }];
  });

  const expected = parseMarkers(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(fixture.absolutePath, 'utf8'),
  ).expected.filter((e) => comparedRuleIds.has(e.ruleId));

  return {
    label,
    divergence: knownDivergences.get(label),
    observedKeys: toSortedSet(observed.map((o) => key(o.ruleId, o.line))),
    // A file-scoped marker matches the rule on whatever line it fired.
    expectedKeys: toSortedSet(
      expected.map((e) =>
        e.fileScoped
          ? key(
              e.ruleId,
              observed.find((o) => o.ruleId === e.ruleId)?.line ?? 0,
            )
          : key(e.ruleId, e.line),
      ),
    ),
  };
});

describe('ESLint bridge', () => {
  test('every fixture was linted and parsed', () => {
    // A fixture the run skipped, or one that failed to parse, reports nothing
    // and would pass every comparison below.
    assert.deepStrictEqual(
      fixtures
        .filter((fixture) => !resultByFile.has(fixture.absolutePath))
        .map((fixture) => fixture.absolutePath),
      [],
    );

    assert.deepStrictEqual(
      results.flatMap((result) =>
        result.messages
          .filter((message) => message.fatal === true)
          .map((message) => `${result.filePath}: ${message.message}`),
      ),
      [],
    );
  });

  test('every known divergence names a fixture', () => {
    const labels = new Set(fixtureCases.map((c) => c.label));

    assert.deepStrictEqual(
      Array.from(knownDivergences.keys()).filter((label) => !labels.has(label)),
      [],
    );
  });

  describe.each(fixtureCases.filter((c) => c.divergence === undefined))(
    '$label',
    ({ observedKeys, expectedKeys }) => {
      test('diagnostics match the markers', () => {
        assert.deepStrictEqual(observedKeys, expectedKeys);
      });
    },
  );

  describe.each(fixtureCases.filter((c) => c.divergence !== undefined))(
    '$label',
    ({ observedKeys, expectedKeys }) => {
      test('still diverges (remove it from knownDivergences once it agrees)', () => {
        assert.notDeepEqual(observedKeys, expectedKeys);
      });
    },
  );
});
