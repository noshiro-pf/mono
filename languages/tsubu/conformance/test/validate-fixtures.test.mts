import * as fs from 'node:fs';
import {
  fixturesRootPath,
  isKnownRuleId,
  listFixtures,
  parseMarkers,
} from '../src/index.mjs';

/**
 * Phase 0 structural validation of the conformance corpus
 * (docs/tsubu/conformance-corpus.md). Engine execution (ESLint
 * preset / the dedicated checker) is added in Phase 1; until then this suite
 * guarantees that every fixture is well-formed.
 */

const listing = listFixtures(fixturesRootPath);

const allFixtures = listing.fixtures.map((fixture) => ({
  label: `${fixture.area}/${fixture.rule}/${fixture.kind}/${fixture.fileName}`,
  ruleId: `${fixture.area}/${fixture.rule}`,
  kind: fixture.kind,
  parsed: parseMarkers(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(fixture.absolutePath, 'utf8'),
  ),
}));

const validFixtures = allFixtures.filter((fixture) => fixture.kind === 'valid');

const invalidFixtures = allFixtures.filter(
  (fixture) => fixture.kind === 'invalid',
);

describe('fixture structure', () => {
  test('directory layout has no unexpected entries', () => {
    assert.deepStrictEqual(listing.problems, []);
  });

  test('corpus is not empty', () => {
    assert.isTrue(allFixtures.length > 0);
  });

  test('every rule directory is a known neutral rule id', () => {
    const unknown = allFixtures
      .map((fixture) => fixture.ruleId)
      .filter((ruleId) => !isKnownRuleId(ruleId));

    assert.deepStrictEqual(unknown, []);
  });
});

describe('fixture markers', () => {
  test.each(allFixtures)('$label: markers are well-formed', ({ parsed }) => {
    assert.deepStrictEqual(parsed.problems, []);
  });

  test.each(validFixtures)(
    '$label: valid fixture has no markers',
    ({ parsed }) => {
      assert.deepStrictEqual(parsed.expected, []);
    },
  );

  test.each(invalidFixtures)(
    '$label: invalid fixture has at least one marker',
    ({ parsed }) => {
      assert.isTrue(parsed.expected.length > 0);
    },
  );

  test.each(invalidFixtures)(
    '$label: every expected rule id is known',
    ({ parsed }) => {
      const unknown = parsed.expected
        .map((diagnostic) => diagnostic.ruleId)
        .filter((ruleId) => !isKnownRuleId(ruleId));

      assert.deepStrictEqual(unknown, []);
    },
  );
});
