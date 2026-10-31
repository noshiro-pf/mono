import { parseForESLint } from '@typescript-eslint/parser';
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
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  eslintConfigOffForOxlint,
  eslintRulesMovedToOxlint,
  oxlintConfig,
  toOxlintRuleName,
} from '../../configs/oxlint-rules.mjs';
import { readRepositoryFile } from '../lib/repo-files.mjs';
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
    ...(await findEslintDisableDirectives()),
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

/**
 * The `eslint-disable`, `eslint-disable-line` and `eslint-disable-next-line`
 * directives in `text`, with the line each starts on and the rules it names.
 * Read from the comments the parser found, so a string or a template that looks
 * like a comment is not one, and parsed as ESLint's
 * `SourceCode#getDisableDirectives` parses them (not typed public API, so
 * copied; the test compares the two): the reason starts at the first ` -- `
 * (two or more dashes), a line comment must be `-line` or `-next-line`, and a
 * `-line` block must fit on its line. `filePath` picks the dialect by its
 * extension, as it does for ESLint (`.ts` has no JSX: `<T>x` is a cast).
 */
export const findDirectivesIn = (
  text: string,
  filePath: string,
): readonly Readonly<{ line: number; ruleIds: readonly string[] }>[] =>
  Arr.generate(function* () {
    const { comments } = parseForESLint(text, {
      filePath,
      comment: true,
      loc: true,
      range: true,
    }).ast;

    for (const comment of comments) {
      const reasonAt = comment.value.search(/\s-{2,}\s/u);

      const directive = (
        reasonAt === -1 ? comment.value : comment.value.slice(0, reasonAt)
      ).trim();

      const label = /^[a-z-]+(?=\s|$)/u.exec(directive)?.[0];

      const applies =
        label === 'eslint-disable-next-line' ||
        (label === 'eslint-disable-line' &&
          comment.loc.start.line === comment.loc.end.line) ||
        (label === 'eslint-disable' && text.startsWith('/*', comment.range[0]));

      if (applies) {
        yield {
          line: comment.loc.start.line,
          ruleIds: parseRuleList(directive.slice(label.length)),
        };
      }
    }
  });

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

/**
 * The build-output guard every lint script starts with. Its exact path is
 * `check:root:deps-built-guard`'s to check; here it is only looked past.
 */
const depsBuiltGuardPrefix =
  /^node (?:\.\.\/)+tools\/scripts\/cmd\/assert-deps-built\.mts && /u;

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

const git = (
  args: readonly string[],
  cwd: string = projectRootPath,
): readonly string[] =>
  execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 2 ** 28 })
    .split('\n')
    .filter((line) => line !== '');

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

const ruleEntry = (ruleId: string): unknown =>
  hasKey(eslintRulesMovedToOxlint, ruleId)
    ? eslintRulesMovedToOxlint[ruleId]
    : undefined;

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

const checkPackage = async (dir: string): Promise<PackageResult> => {
  const scripts = await readScripts(dir);

  const scriptViolations = Arr.generate(function* () {
    for (const [name, prefix] of Object.entries(lintScriptPrefixes)) {
      const script: unknown = scripts[name];

      if (
        !isString(script) ||
        !script.replace(depsBuiltGuardPrefix, '').startsWith(prefix)
      ) {
        yield `${dir}/package.json: "${name}" must start with \`${prefix}\`.`;
      }
    }
  });

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

/**
 * `git grep -z`, for which no match is exit status 1 rather than a failure;
 * NUL-separated, so a path git would quote arrives as it is.
 */
const gitGrep = (args: readonly string[]): readonly string[] => {
  const result = spawnSync('git', ['grep', '-z', ...args], {
    cwd: projectRootPath,
    encoding: 'utf8',
    maxBuffer: 2 ** 28,
  });

  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`git grep failed: ${result.stderr}`);
  }

  return result.stdout.split('\0').filter((entry) => entry !== '');
};

/** An `eslint-disable` comment that names a moved rule anywhere ESLint lints. */
const findEslintDisableDirectives = async (): Promise<readonly string[]> => {
  const moved = new Set(movedRuleIds);

  // Whole files, not grep lines: a block directive's rule list can start on the
  // line after the keyword, and only a parser tells a comment from a string.
  // ESLint lints no Markdown here, so a README's fence is not read.
  const files = gitGrep([
    '--files-with-matches',
    '--fixed-strings',
    'eslint-disable',
    '--',
    ':(glob)apps/**',
    ':(glob)libs/**',
    ':(glob)languages/**',
  ]).filter((file) => lintedExtensions.test(file));

  const perFile = await Promise.all(
    files.map(async (file) => {
      const text = await readRepositoryFile(file);

      if (Result.isErr(text)) {
        return [text.value];
      }

      // Parsing is the cost; a file that names no moved rule has nothing to
      // report.
      if (movedRuleIds.every((ruleId) => !text.value.includes(ruleId))) {
        return [];
      }

      const directives = Result.fromThrowable(() =>
        findDirectivesIn(text.value, file),
      );

      if (Result.isErr(directives)) {
        return [
          `${file}: cannot be parsed to read its directives: ${unknownToString(directives.value)}`,
        ];
      }

      return directives.value.flatMap(({ line, ruleIds }) =>
        ruleIds
          .filter((ruleId) => moved.has(ruleId))
          .map(
            (ruleId) =>
              `${file}:${line}: ${ruleId} is checked by oxlint; disable it with an \`oxlint-disable\` comment naming \`${toOxlintRuleName(ruleId)}\`.`,
          ),
      );
    }),
  );

  return perFile.flat();
};

/** ESLint's `parseListConfig`: comma-separated, each id optionally quoted. */
const parseRuleList = (value: string): readonly string[] =>
  value
    .split(',')
    .map((name) =>
      name
        .trim()
        .replace(/^(?<quote>['"]?)(?<ruleId>.*)\k<quote>$/su, '$<ruleId>'),
    )
    .filter((ruleId) => ruleId !== '');

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
