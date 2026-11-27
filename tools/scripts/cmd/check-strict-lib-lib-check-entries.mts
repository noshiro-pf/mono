import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import * as ts from 'typescript';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';

/**
 * Fails when a strict-lib harness's lib-check config leaves out an entry file
 * the other harnesses' configs of its group name.
 *
 * The regression cases of the strict standard library are the
 * `strict-lib/configs/tsconfig/lib-check-entry*.ts` files, and each of the
 * twelve harnesses (`strict-lib/vX.Y/`) runs one only when its own configs name
 * it in `files`. A list that leaves one out stops that TypeScript version
 * running those cases, and nothing else notices:
 * `check:root:type-check-coverage` asks only that some config names each file.
 *
 * Which configs name an entry is read from the configs themselves rather than
 * listed here, so that a new entry needs no change to this guard: an entry that
 * any harness names in a config of a group is one every harness names in each
 * config of that group, from the version its `since-X.Y` suffix gives on, and
 * no harness names it before.
 */
export const checkStrictLibLibCheckEntries = async (): Promise<
  Result<number, string>
> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return Result.err(`❌ ${tracked.value}`);
  }

  const mut_harnesses = new Map<string, Map<string, readonly string[]>>();

  for (const file of tracked.value) {
    const match = harnessConfigPattern.exec(file);

    if (match === null) {
      continue;
    }

    const [, version = '', configName = ''] = match;

    const text = await readRepositoryFile(file);

    if (Result.isErr(text)) {
      return Result.err(`❌ ${text.value}`);
    }

    const entries = entryFilesOf(file, text.value);

    if (Result.isErr(entries)) {
      return Result.err(`❌ ${entries.value}`);
    }

    const mut_configs =
      mut_harnesses.get(version) ?? new Map<string, readonly string[]>();

    mut_configs.set(configName, entries.value);

    mut_harnesses.set(version, mut_configs);
  }

  const harnesses: readonly Harness[] = Array.from(
    mut_harnesses,
    ([version, configs]) => ({ version, configs }),
  );

  const problems = findMissingEntries(harnesses);

  return Arr.isNonEmpty(problems)
    ? Result.err(
        [
          `❌ ${problems.length.toString()} problem(s) in the strict-lib lib-check configs, out of step with the other harnesses:`,
          '',
          ...problems.map(problemToString),
          '',
          'Every harness names each lib-check entry in each config of its group',
          '(tsconfig.lib-check.json with tsconfig.lib-check.webworker.json, and',
          'tsconfig.lib-files-check.branded.json alone), from the version its',
          '`since-X.Y` suffix gives on. Add the entry to the config, or take it',
          'out of the one that should not name it.',
        ].join('\n'),
      )
    : Result.ok(harnesses.length);
};

/**
 * The configs whose `files` name lib-check entries, in the groups that name the
 * same ones: the plain flavor's check for the DOM and for a web worker, and the
 * branded flavor's.
 */
export const CONFIG_GROUPS = [
  ['tsconfig.lib-check.json', 'tsconfig.lib-check.webworker.json'],
  ['tsconfig.lib-files-check.branded.json'],
] as const satisfies readonly (readonly string[])[];

/** A harness: its TypeScript minor (`5.4`) and the entries each config names. */
export type Harness = Readonly<{
  version: string;
  /** Config file name → the entry files it names, as `lib-check-entry*.ts`. */
  configs: ReadonlyMap<string, readonly string[]>;
}>;

/** A config that leaves out an entry, names one too early, or is missing. */
export type Problem = Readonly<
  | { kind: 'missing-entry'; version: string; config: string; entry: string }
  | { kind: 'too-early'; version: string; config: string; entry: string }
  | { kind: 'missing-config'; version: string; config: string }
>;

/**
 * What {@link checkStrictLibLibCheckEntries} reports for `harnesses`, sorted by
 * version, config and entry.
 */
export const findMissingEntries = (
  harnesses: readonly Harness[],
): readonly Problem[] => {
  const sorted = harnesses.toSorted((a, b) =>
    compareVersions(a.version, b.version),
  );

  return CONFIG_GROUPS.flatMap((group) => {
    const named = harnesses.flatMap((harness) =>
      group.flatMap((config) => harness.configs.get(config) ?? []),
    );

    if (!Arr.isNonEmpty(named)) {
      return [];
    }

    const entries = Arr.uniq(named).toSorted();

    return sorted.flatMap((harness) =>
      group.flatMap((config): readonly Problem[] => {
        const names = harness.configs.get(config);

        if (names === undefined) {
          return [{ kind: 'missing-config', version: harness.version, config }];
        }

        return entries.flatMap((entry): readonly Problem[] => {
          const since = sinceOf(entry);

          const expected =
            since === undefined || compareVersions(since, harness.version) <= 0;

          const present = names.includes(entry);

          return expected && !present
            ? [
                {
                  kind: 'missing-entry',
                  version: harness.version,
                  config,
                  entry,
                },
              ]
            : !expected && present
              ? [{ kind: 'too-early', version: harness.version, config, entry }]
              : [];
        });
      }),
    );
  });
};

/**
 * The TypeScript minor an entry holds from, read from its `since-X.Y` suffix
 * (`lib-check-entry.branded.since-5.6.ts` → `5.6`), or `undefined` for one that
 * holds for every harness.
 */
export const sinceOf = (entry: string): string | undefined =>
  /\.since-(\d+\.\d+)\.ts$/u.exec(entry)?.[1];

/** The lib-check entries a config's `files` names, as their file names. */
export const entryFilesOf = (
  configFile: string,
  text: string,
): Result<readonly string[], string> => {
  // `config` is typed `any`; it is read as `unknown` and narrowed below.
  const parsed: Readonly<{ config?: unknown; error?: ts.Diagnostic }> =
    ts.parseConfigFileTextToJson(configFile, text);

  const { config, error } = parsed;

  if (error !== undefined) {
    return Result.err(
      `${configFile}: ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`,
    );
  }

  const files: unknown =
    isRecord(config) && hasKey(config, 'files') ? config.files : ([] as const);

  const paths = Arr.isArray(files) ? files.filter(isString) : ([] as const);

  if (!Arr.isArray(files) || paths.length !== files.length) {
    return Result.err(`${configFile}: \`files\` is not a list of paths.`);
  }

  const directory = path.posix.dirname(configFile);

  return Result.ok(
    paths
      .map((file) => path.posix.join(directory, file))
      .filter((file) => entryPattern.test(file))
      .map((file) => path.posix.basename(file)),
  );
};

const harnessConfigPattern =
  /^strict-lib\/v(\d+\.\d+)\/(tsconfig\.lib-check\.json|tsconfig\.lib-check\.webworker\.json|tsconfig\.lib-files-check\.branded\.json)$/u;

const entryPattern =
  /^strict-lib\/configs\/tsconfig\/lib-check-entry[^/]*\.ts$/u;

const compareVersions = (a: string, b: string): number => {
  const [aMajor = 0, aMinor = 0] = a.split('.').map(Number);

  const [bMajor = 0, bMinor = 0] = b.split('.').map(Number);

  return aMajor === bMajor ? aMinor - bMinor : aMajor - bMajor;
};

const problemToString = (problem: Problem): string => {
  const config = `strict-lib/v${problem.version}/${problem.config}` as const;

  switch (problem.kind) {
    case 'missing-entry':
      return `  ${config} does not name ${problem.entry}`;

    case 'too-early':
      return `  ${config} names ${problem.entry}, which holds only from TypeScript ${sinceOf(problem.entry) ?? ''} on`;

    case 'missing-config':
      return `  ${config} is missing`;
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkStrictLibLibCheckEntries().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value.toString()} strict-lib harness(es) read; each lib-check config names the entries of its group.`,
  );
}
