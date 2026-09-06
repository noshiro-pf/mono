import * as fs from 'node:fs';
import * as path from 'node:path';

export type FixtureKind = 'invalid' | 'valid';

export type FixtureFile = Readonly<{
  /** Spec area directory name (e.g. `banned-syntax`). */
  area: string;
  /** Rule directory name (e.g. `no-var`). */
  rule: string;
  kind: FixtureKind;
  fileName: string;
  absolutePath: string;
}>;

export type FixtureListing = Readonly<{
  fixtures: readonly FixtureFile[];
  /** Structural problems (unexpected files/directories, empty rule dirs). */
  problems: readonly string[];
}>;

export const fixturesRootPath = path.resolve(
  import.meta.dirname,
  '../fixtures',
);

export const listFixtures = (rootDir: string): FixtureListing => {
  const listings = listDirectories(rootDir).flatMap((area) =>
    listDirectories(path.join(rootDir, area)).map((rule) =>
      listRuleFixtures(area, rule, path.join(rootDir, area, rule)),
    ),
  );

  return {
    fixtures: listings.flatMap((listing) => listing.fixtures),
    problems: listings.flatMap((listing) => listing.problems),
  };
};

const listRuleFixtures = (
  area: string,
  rule: string,
  ruleDir: string,
): FixtureListing => {
  const kinds = listDirectories(ruleDir);

  const listings = kinds.map((kind) =>
    kind === 'valid' || kind === 'invalid'
      ? listKindFixtures(area, rule, kind, path.join(ruleDir, kind))
      : {
          fixtures: [],
          problems: [
            `${area}/${rule}: unexpected directory "${kind}" (only valid/ and invalid/ are allowed)`,
          ],
        },
  );

  const missingInvalidProblems = kinds.includes('invalid')
    ? ([] as const)
    : ([
        `${area}/${rule}: missing invalid/ (a rule without an invalid fixture checks nothing)`,
      ] as const);

  return {
    fixtures: listings.flatMap((listing) => listing.fixtures),
    problems: [
      ...listings.flatMap((listing) => listing.problems),
      ...missingInvalidProblems,
    ],
  };
};

const listKindFixtures = (
  area: string,
  rule: string,
  kind: FixtureKind,
  kindDir: string,
): FixtureListing => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = fs
    .readdirSync(kindDir, { withFileTypes: true })
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return {
    fixtures: entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.mts'))
      .map((entry) => ({
        area,
        rule,
        kind,
        fileName: entry.name,
        absolutePath: path.join(kindDir, entry.name),
      })),
    problems: entries
      .filter((entry) => !entry.isFile() || !entry.name.endsWith('.mts'))
      .map(
        (entry) =>
          `${area}/${rule}/${kind}: unexpected entry "${entry.name}" (only *.mts fixture files are allowed)`,
      ),
  };
};

const listDirectories = (dir: string): readonly string[] =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();
