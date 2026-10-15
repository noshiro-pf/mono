import { ESLint, type Linter } from 'eslint';
import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  Arr,
  fastDeepEqual,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import {
  eslintConfigOffForOxlint,
  eslintRulesMovedToOxlint,
  oxlintConfig,
  toOxlintRuleName,
} from '../../configs/oxlint-rules.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a rule in `tools/configs/oxlint-rules.mts` is no longer checked
 * the way ESLint checked it, or when a package stops running oxlint.
 *
 * Every failure here is silent otherwise. The off block is last in each
 * `eslint.config.mts`, so a package override of a moved rule, or a new option
 * in eslint-config-typed, changes nothing ESLint does and is never seen by
 * oxlint, whose options are a copy. An `eslint-disable` naming a moved rule is
 * reported by ESLint as unused and deleted by `--fix`, after which oxlint
 * reports the line it was suppressing. And an `ignorePatterns` entry that
 * matches a file ESLint lints drops the moved rules from it.
 *
 * Reading each package's configuration needs the workspace built, as
 * `eslint.config.mts` imports the plugins by name.
 */
export const checkOxlintRules = async (): Promise<Result<number, string>> => {
  const packageDirs = await listLintedPackages();

  const perPackage = await Promise.all(packageDirs.map(checkPackage));

  const violations = [
    ...perPackage.flatMap(({ problems }) => problems),
    ...describeMismatches(perPackage.flatMap(({ mismatches }) => mismatches)),
    ...findEslintDisableDirectives(),
  ] as const;

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} problem(s) with the rules oxlint checks instead of ESLint:`,
        '',
        ...violations.map((violation) => `  ${violation}`),
        '',
        'The rules, and what a rule must satisfy to be listed, are in',
        'tools/configs/oxlint-rules.mts. A rule a package needs to configure',
        'differently goes back to ESLint: remove it from that table.',
      ].join('\n'),
    );
  }

  return Result.ok(packageDirs.length);
};

const movedRuleIds = Object.keys(eslintRulesMovedToOxlint);

const lintedExtensions = /\.(?:[cm]?[jt]s|[jt]sx)$/u;

type PackageResult = Readonly<{
  problems: readonly string[];
  mismatches: readonly Mismatch[];
}>;

/** A moved rule ESLint would apply otherwise, at the first file found. */
type Mismatch = Readonly<{ ruleId: string; file: string; actual: unknown }>;

const lintScriptPrefixes = {
  'check:lint': 'oxlint . && eslint ',
  'fix:lint': 'oxlint . --fix && eslint ',
} as const;

/** The packages `ws:fix:lint` reaches: every member with a `fix:lint`. */
const listLintedPackages = async (): Promise<readonly string[]> => {
  const manifests = git(['ls-files', '*/package.json'])
    .filter((file) => !file.startsWith('experimental/'))
    .map(path.dirname);

  const withFixLint = await Promise.all(
    manifests.map(async (dir) =>
      hasKey(await readScripts(dir), 'fix:lint') ? [dir] : [],
    ),
  );

  return withFixLint.flat().toSorted();
};

const checkPackage = async (dir: string): Promise<PackageResult> => {
  const scripts = await readScripts(dir);

  const scriptViolations = Object.entries(lintScriptPrefixes).flatMap(
    ([name, prefix]) => {
      const script: unknown = scripts[name];

      return isString(script) && script.startsWith(prefix)
        ? []
        : [`${dir}/package.json: "${name}" must start with \`${prefix}\`.`];
    },
  );

  const configModule: unknown = await import(
    pathToFileURL(path.join(projectRootPath, dir, 'eslint.config.mts')).href
  );

  const configs: unknown =
    isRecord(configModule) && hasKey(configModule, 'default')
      ? configModule.default
      : undefined;

  if (!Arr.isArray(configs) || configs.at(-1) !== eslintConfigOffForOxlint) {
    return {
      problems: Arr.toPushed(
        scriptViolations,
        `${dir}/eslint.config.mts: the exported array must end with \`eslintConfigOffForOxlint\`.`,
      ),
      mismatches: [],
    };
  }

  const resolved = await checkResolvedRules(
    dir,
    configs.filter((config) => config !== eslintConfigOffForOxlint),
  );

  return {
    problems: [...scriptViolations, ...resolved.problems],
    mismatches: resolved.mismatches,
  };
};

/**
 * Resolves the package's configuration without the off block, for every file
 * ESLint lints, and compares each moved rule with the table.
 */
const checkResolvedRules = async (
  dir: string,
  configs: readonly unknown[],
): Promise<PackageResult> => {
  const cwd = path.join(projectRootPath, dir);

  const eslint = new ESLint({
    cwd,
    overrideConfigFile: true,
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the array a package's `eslint.config.mts` exports, which ESLint validates
    overrideConfig: Array.from(configs as readonly Linter.Config[]),
  });

  const files = git(['ls-files'], cwd).filter((file) =>
    lintedExtensions.test(file),
  );

  const mut_mismatches = new Map<string, Mismatch>();

  const mut_hiddenFiles: string[] = [];

  for (const file of files) {
    const absolute = path.join(cwd, file);

    if (await eslint.isPathIgnored(absolute)) {
      continue;
    }

    const resolved: unknown = await eslint.calculateConfigForFile(absolute);

    const rules: unknown =
      isRecord(resolved) && hasKey(resolved, 'rules')
        ? resolved.rules
        : undefined;

    if (!isRecord(rules)) {
      continue;
    }

    const repoRelative = path.join(dir, file);

    if (
      oxlintConfig.ignorePatterns.some((pattern) =>
        path.matchesGlob(repoRelative, pattern),
      )
    ) {
      mut_hiddenFiles.push(repoRelative);
    }

    for (const ruleId of movedRuleIds) {
      if (mut_mismatches.has(ruleId)) {
        continue;
      }

      if (!isSameEntry(rules[ruleId], ruleEntry(ruleId))) {
        mut_mismatches.set(ruleId, {
          ruleId,
          file: repoRelative,
          actual: rules[ruleId] ?? 'off',
        });
      }
    }
  }

  return {
    problems: mut_hiddenFiles.map(
      (file) =>
        `${file}: ESLint lints it, but an \`ignorePatterns\` entry keeps oxlint from it.`,
    ),
    mismatches: Array.from(mut_mismatches.values()),
  };
};

/** One line per rule, however many packages it differs in. */
const describeMismatches = (
  mismatches: readonly Mismatch[],
): readonly string[] =>
  Array.from(Map.groupBy(mismatches, ({ ruleId }) => ruleId)).flatMap(
    ([ruleId, group]) => {
      if (!Arr.isNonEmpty(group)) {
        return [];
      }

      const [{ file, actual }] = group;

      return [
        `${ruleId}: ESLint would apply ${JSON.stringify(actual)}, the table has ${JSON.stringify(ruleEntry(ruleId))} (${file}, and ${group.length - 1} other package(s)).`,
      ];
    },
  );

/** An `eslint-disable` comment that names a moved rule anywhere ESLint lints. */
const findEslintDisableDirectives = (): readonly string[] => {
  const moved = new Set(movedRuleIds);

  const lines = gitGrep([
    '--line-number',
    '--extended-regexp',
    'eslint-disable(-next-line|-line)?[[:space:]]',
    '--',
    ':(glob)apps/**',
    ':(glob)libs/**',
    ':(glob)languages/**',
  ]);

  return lines.flatMap((line) => {
    const [location, directive] = splitGrepLine(line);

    const ruleList = directive
      .split(/eslint-disable(?:-next-line|-line)?\s+/u, 2)
      .at(1)
      ?.split(' -- ', 1)
      .at(0)
      ?.replace('*/', '');

    if (ruleList === undefined) {
      return [];
    }

    return ruleList
      .split(',')
      .map((ruleId) => ruleId.trim())
      .filter((ruleId) => moved.has(ruleId))
      .map(
        (ruleId) =>
          `${location}: ${ruleId} is checked by oxlint; disable it with an \`oxlint-disable\` comment naming \`${toOxlintRuleName(ruleId)}\`.`,
      );
  });
};

const ruleEntry = (ruleId: string): unknown =>
  hasKey(eslintRulesMovedToOxlint, ruleId)
    ? eslintRulesMovedToOxlint[ruleId]
    : undefined;

/** ESLint resolves a severity to a number; the table writes it as a word. */
const isSameEntry = (actual: unknown, expected: unknown): boolean => {
  const [actualSeverity, ...actualOptions] = Arr.isArray(actual)
    ? actual
    : ([actual] as const);

  const [expectedSeverity, ...expectedOptions] = Arr.isArray(expected)
    ? expected
    : ([expected] as const);

  return (
    severityNumber(actualSeverity) === severityNumber(expectedSeverity) &&
    fastDeepEqual(actualOptions, expectedOptions)
  );
};

const severityNumber = (severity: unknown): unknown => {
  switch (severity) {
    case 'off':
      return 0;

    case 'warn':
      return 1;

    case 'error':
      return 2;

    default:
      return severity;
  }
};

const readScripts = async (
  dir: string,
): Promise<ReadonlyRecord<string, unknown>> => {
  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the package.json of a workspace member git lists
    await fs.readFile(
      path.resolve(projectRootPath, dir, 'package.json'),
      'utf8',
    ),
  );

  return isRecord(manifest) &&
    hasKey(manifest, 'scripts') &&
    isRecord(manifest.scripts)
    ? manifest.scripts
    : {};
};

/** `path:line:text` → [`path:line`, `text`]. */
const splitGrepLine = (line: string): FixedLengthTuple<2, string> => {
  const [file = '', lineNumber = '', ...text] = line.split(':');

  return [`${file}:${lineNumber}`, text.join(':')];
};

/** `git grep`, for which no match is exit status 1 rather than a failure. */
const gitGrep = (args: readonly string[]): readonly string[] => {
  const result = spawnSync('git', Arr.toUnshifted('grep')(args), {
    cwd: projectRootPath,
    encoding: 'utf8',
    maxBuffer: 2 ** 28,
  });

  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`git grep failed: ${result.stderr}`);
  }

  return result.stdout.split('\n').filter((line) => line !== '');
};

const git = (
  args: readonly string[],
  cwd: string = projectRootPath,
): readonly string[] =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 2 ** 28 })
    .split('\n')
    .filter((line) => line !== '');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkOxlintRules().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} package(s) checked; ESLint would apply each of the ${movedRuleIds.length} rules oxlint checks instead exactly as the table says.`,
  );
}
