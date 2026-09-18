import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Optional, Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { scenarioDir } from './paths.mjs';

/**
 * The libraries a scenario measures SynState against, plus SynState itself.
 *
 * This list is the cache key for the measurements as much as it is provenance:
 * a number is only comparable with another measured against the same versions,
 * and CI re-measures exactly when one of these moves. So it has to name every
 * library any scenario imports — `benchmark:conditional-fan-out` compares
 * against four of them, `benchmark:derived-chain` against six.
 */
export const comparisonLibraries = [
  'synstate',
  'rxjs',
  'jotai',
  'mobx',
  '@reduxjs/toolkit',
  'zustand',
  'valtio',
] as const;

/**
 * Where the measurement was taken, recorded into every results file.
 *
 * Absolute milliseconds are only comparable within one environment, and this
 * repository learned that the expensive way: a re-measurement moved SynState's
 * derived-chain row by 38% and its diamond row by 99% while every competitor
 * stood still, and telling a machine change from a code change afterwards meant
 * reading commit authorship and timezones. Recorded here, the question is
 * answered by the file.
 */
export type BenchmarkEnvironment = Readonly<{
  /**
   * `'github-actions'` when the workflow measured it, `'local'` otherwise.
   * Only the first is comparable across runs, which is why the workflow exists.
   */
  runner: 'github-actions' | 'local';

  /** The runner image, e.g. `'ubuntu-24.04'`. `null` when run locally. */
  runnerImage: string | null;

  node: string;

  platform: string;

  arch: string;

  cpu: string;

  /**
   * Day precision. A re-measurement is a new fact and should show in the diff;
   * the time of day is not one, and would churn these files for nothing.
   */
  measuredOn: string;

  /** Resolved versions of {@link comparisonLibraries}. */
  libraries: ReadonlyRecord<string, string>;
}>;

/** Captures the environment of the run in progress. */
export const readBenchmarkEnvironment =
  async (): Promise<BenchmarkEnvironment> => ({
    runner:
      process.env['GITHUB_ACTIONS'] === 'true' ? 'github-actions' : 'local',

    runnerImage: process.env['ImageOS'] ?? process.env['RUNNER_IMAGE'] ?? null,

    node: process.version,

    platform: `${os.type()} ${os.release()}`,

    arch: process.arch,

    cpu: Optional.unwrapOr(
      Optional.map(Optional.fromNullable(os.cpus()[0]), (c) => c.model),
      'unknown',
    ),

    measuredOn: Temporal.Now.plainDateISO().toString(),

    libraries: await readComparisonLibraryVersions(),
  });

const synstatePackageDir = path.resolve(scenarioDir, '../../..');

/**
 * Reads each comparison library's installed version.
 *
 * Resolved from the scenario directory rather than from this package, because
 * that is where the scenario files resolve them from: they live in
 * `libs/synstate/samples/`, so `rxjs` there is the copy that package devDepends
 * on, which need not be the copy this one does.
 */
export const readComparisonLibraryVersions = async (): Promise<
  ReadonlyRecord<string, string>
> => {
  const entries = await Promise.all(
    comparisonLibraries.map(async (name) => {
      // SynState itself has no self-link in its own `node_modules`, so its
      // version comes from its manifest; everything else is a dependency
      // resolved exactly where the scenario files resolve it.
      const manifestPath =
        name === 'synstate'
          ? path.resolve(synstatePackageDir, 'package.json')
          : path.resolve(
              synstatePackageDir,
              'node_modules',
              name,
              'package.json',
            );

      const read = await Result.fromPromise(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(manifestPath, 'utf8'),
      );

      if (Result.isErr(read)) {
        throw new Error(
          [
            `Cannot read the installed version of "${name}".`,
            `Looked at ${manifestPath}.`,
            'The benchmark records the versions it compared, so a missing one',
            'is a measurement nobody can interpret later. Run `pnpm install`,',
            'or drop the library from `comparisonLibraries` if no scenario',
            'uses it any more.',
          ].join('\n'),
        );
      }

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const manifest = JSON.parse(read.value) as Readonly<{ version?: string }>;

      return [name, manifest.version ?? 'unknown'] as const;
    }),
  );

  return Object.fromEntries(entries);
};
