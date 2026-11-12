import { fork } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { findPackageJSON } from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Arr, isRecord, isString, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
// A measuring child, which runs this file too, loads it as well: it costs the
// child little, since Prettier runs in a process of its own and only when
// `formatPackage` is called.
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how apps reach its shared scripts
import { formatPackage } from '../../../../tools/configs/format-package.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';
import {
  type BenchmarkResults,
  type EntryResult,
  EntryResultSchema,
  type ScenarioResult,
} from './results.mjs';
import {
  isSubject,
  libraryOf,
  packageOf,
  resultsPath,
  type Scenario,
  scenarios,
} from './scenarios.mjs';
import { medianOverRounds, ROUNDS, timeEntry } from './time-entry.mjs';

/**
 * Measures every scenario of the benchmark page and writes what it measured to
 * `src/data/benchmark-results.json`, which `gen:benchmark` embeds into the
 * pages. Every scenario is measured in one run, so that the whole page stands
 * on one build of synstate-next, one machine and one date.
 *
 * Each library is measured in a process of its own, in production mode
 * (`NODE_ENV=production`), as an application ships it. V8 optimizes a function
 * for the shapes it has seen, and what one library teaches it would carry into
 * the next in a shared process, so a row's figure would depend on the row
 * before it.
 */
// There is no per-scenario run, and nothing is written until every scenario is
// measured: a failure means a library or synstate-next changed, after which the
// page must stand on one run again, so keeping what was measured before it
// would mix two builds on one page.
//
// `benchmark` builds synstate-next and synstate, which the runs load from
// `dist/`. `tools/configs/tsconfig.tsx.json` maps the bare `ts-data-forge` and
// `ts-std-forge` to their sources, but not a subpath such as
// `ts-data-forge/array`, which they load from `dist/` too; so a clone with
// nothing built, or one whose ts-data-forge changed, runs `ws:build:deps` first.
// `assert-deps-built.mts` would say so on a clone with nothing built, but it
// asks for every package the app links, the ESLint ones included, which the
// runs never load.
const main = async (): Promise<void> => {
  if (process.env[childEnv] !== undefined) {
    await measureAsChild();

    return;
  }

  // For a direct run: through `pnpm run benchmark`, `run-s` already refuses an
  // extra argument as a task it does not know, before anything is built.
  if (Arr.isNonEmpty(Arr.skip(process.argv, 2))) {
    throw new Error(
      'the benchmark takes no arguments: it measures every scenario, so that the page stands on one run',
    );
  }

  const today = new Date();

  const environment = {
    // As synstate's documentation records it (its `environment.mts`).
    runner:
      process.env['GITHUB_ACTIONS'] === 'true'
        ? ('github-actions' as const)
        : ('local' as const),
    runnerImage: process.env['ImageOS'] ?? process.env['RUNNER_IMAGE'] ?? null,
    node: process.version,
    os: `${os.type()} ${os.release()} (${process.arch})`,
    cpu: os.cpus()[0]?.model ?? 'unknown',
    libraries: await readLibraryVersions(),
    measuredOn: today.toISOString().slice(0, 10),
  } as const;

  const mut_results = new Map<string, ScenarioResult>();

  for (const scenario of scenarios) {
    console.info(`\n## ${scenario.id}`);

    mut_results.set(scenario.id, await measureScenario(scenario));
  }

  const results: BenchmarkResults = {
    environment,
    scenarios: Object.fromEntries(mut_results),
  } as const;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(resultsPath, `${JSON.stringify(results, undefined, 2)}\n`);

  const shown = path.relative(process.cwd(), resultsPath);

  // Laid out as it is committed, so that neither `benchmark` nor the workflow
  // that uploads it formats it after. A failure fails the run with the file
  // already written in `JSON.stringify`'s layout, which a local run keeps; the
  // workflow, like `synstate-benchmark.yml` over its own `fix:fmt`, uploads
  // only what a run completed.
  if (
    (await formatPackage({
      cwd: workspaceRootPath,
      patterns: [path.relative(workspaceRootPath, resultsPath)],
    })) !== 0
  ) {
    throw new Error(`Prettier failed on ${shown}, written unformatted`);
  }

  console.info(`\nWrote ${shown}`);
};

/**
 * Set to the runner's pid in a process it starts to measure one library. The
 * pid is checked so that a value left in a shell does not turn a runner into a
 * child that writes nothing.
 */
const childEnv = 'SYNSTATE_NEXT_BENCHMARK_CHILD';

/**
 * How long one library may take over one scenario, every point of a sweep
 * included, before its process is stopped. A run over `TIMEOUT_MS` ends its
 * point and every point at least as large, so this is reached only by a library
 * that never returns, or one slow at every point the deep chain still measures;
 * either fails the run rather than leave it waiting.
 */
const childTimeoutMs = 15 * 60 * 1000;

const thisFile = import.meta.filename;

/**
 * Times the entry named on the command line and sends the result to the runner
 * that started this process.
 */
const measureAsChild = async (): Promise<void> => {
  if (process.env[childEnv] !== process.ppid.toString()) {
    throw new Error(
      `${childEnv} is set, but not by this process's parent; unset it to run the benchmark`,
    );
  }

  if (process.send === undefined) {
    throw new Error(
      `${childEnv} is set, but this process has no IPC channel to its runner`,
    );
  }

  const [scenarioId, entryIndex] = Arr.skip(process.argv, 2);

  const scenario = scenarios.find((s) => s.id === scenarioId);

  const entry = scenario?.entries[Number(entryIndex)];

  if (scenario === undefined || entry === undefined) {
    throw new Error(`no entry ${entryIndex ?? ''} in ${scenarioId ?? ''}`);
  }

  const result = await timeEntry(scenario, entry);

  // The callback waits until the message is written out.
  await new Promise<void>((resolve, reject) => {
    process.send?.(result, undefined, {}, (error) => {
      if (error === null) {
        resolve();
      } else {
        reject(error);
      }
    });
  });

  // `process.exit` does not wait for a piped stdout, and a library that left a
  // timer behind would otherwise keep this process alive.
  await new Promise<void>((resolve) => {
    process.stdout.write('', () => {
      resolve();
    });
  });

  process.exit(0);
};

/**
 * Measures entry `index` of `scenario` in a process of its own. Its progress
 * lines go straight to this process's output; its result comes back as its one
 * message.
 */
// synstate-docs' runner (`apps/synstate-docs/scripts/benchmark/own-process.mts`)
// does the same; it is not shared, because this site replaces that one at the
// next major and that runner goes with it.
const measureInChild = (
  scenario: Scenario,
  index: number,
): Promise<EntryResult> =>
  new Promise<EntryResult>((resolve, reject) => {
    const mut_messages: EntryResult[] = [];

    // Messages that are not a result: anything sent fails the run.
    let mut_strays = 0;

    // `execArgv` is inherited, which carries the `tsx` loader along.
    const child = fork(thisFile, [scenario.id, index.toString()], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        [childEnv]: process.pid.toString(),
      },
      timeout: childTimeoutMs,
    });

    child.on('message', (message) => {
      if (EntryResultSchema.is(message)) {
        mut_messages.push(message);
      } else {
        mut_strays += 1;
      }
    });

    child.on('error', reject);

    // `close` rather than `exit`, which can come before the last message.
    child.on('close', (code, signal) => {
      if (
        code === 0 &&
        mut_strays === 0 &&
        Arr.isFixedLengthArray(1, mut_messages)
      ) {
        resolve(mut_messages[0]);
      } else {
        reject(
          new Error(
            `${scenario.id} #${index.toString()} (${scenario.entries[index]?.label ?? ''}) ${signal === null ? `exited with ${code?.toString() ?? 'no code'}` : `was stopped by ${signal}${signal === 'SIGTERM' ? ` (over \`childTimeoutMs\`, ${(childTimeoutMs / 60_000).toString()} minutes, unless stopped from outside)` : ''}`} after ${mut_messages.length.toString()} results and ${mut_strays.toString()} other messages`,
          ),
        );
      }
    });
  });

/**
 * Measures each library of `scenario` in a process of its own, {@link ROUNDS}
 * times. The libraries alternate, and which goes first turns from round to
 * round, so that a slow stretch of the machine falls on all of them.
 */
const measureScenario = async (scenario: Scenario): Promise<ScenarioResult> => {
  const indices = scenario.entries.map((_, index) => index);

  const mut_runs: (readonly [number, EntryResult])[] = [];

  for (const round of Arr.seq(ROUNDS)) {
    for (const index of round % 2 === 0 ? indices : indices.toReversed()) {
      mut_runs.push([index, await measureInChild(scenario, index)]);
    }
  }

  const resultsOf = (index: number): readonly EntryResult[] =>
    mut_runs.filter(([i]) => i === index).map(([, result]) => result);

  if (scenario.kind === 'stats') {
    return {
      kind: 'stats',
      rows: scenario.entries.map((entry, index) => ({
        label: entry.label,
        times: resultsOf(index).flatMap((result) =>
          result.kind === 'times' ? result.times : [],
        ),
      })),
    };
  }

  const series = scenario.entries.map((entry, index) => ({
    label: entry.label,
    results: Arr.generate(function* () {
      for (const result of resultsOf(index)) {
        if (result.kind === 'series') {
          yield result;
        }
      }
    }),
  }));

  return {
    kind: 'series',
    xLabels: series[0]?.results[0]?.xLabels ?? [],
    rows: series.map(({ label, results }) => ({
      label,
      values: medianOverRounds(results.map(({ values }) => values)),
    })),
  };
};

/**
 * The installed versions of the libraries the scenarios measure, each resolved
 * from the file that imports it, as Node.js resolves that import. The scenario
 * files resolve theirs from `libs/synstate` and the deep chain's adapters from
 * `apps/synstate-docs`, so a library installed at two versions there fails the
 * run rather than leave the page naming one of them.
 */
const readLibraryVersions = async (): Promise<
  ReadonlyRecord<string, string>
> => {
  const mut_versions = new Map<string, string>();

  // About fifty lookups, once per run of over an hour: not worth a cache.
  for (const { entries } of scenarios) {
    for (const { label, file } of entries) {
      if (isSubject(label)) {
        continue;
      }

      const name = packageOf[libraryOf(label)];

      if (name === undefined) {
        throw new Error(`no package for ${libraryOf(label)} in \`packageOf\``);
      }

      const manifestPath = Result.fromThrowable(() =>
        findPackageJSON(name, pathToFileURL(file)),
      );

      if (Result.isErr(manifestPath) || manifestPath.value === undefined) {
        throw new Error(
          `${name} does not resolve from ${file}; install it where that file can import it`,
        );
      }

      const manifest: unknown = JSON.parse(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.readFile(manifestPath.value, 'utf8'),
      );

      if (!isRecord(manifest) || !isString(manifest['version'])) {
        throw new Error(`no version in ${manifestPath.value}`);
      }

      const known = mut_versions.get(name);

      if (known !== undefined && known !== manifest['version']) {
        throw new Error(
          `${name} is installed at ${known} for one scenario and at ${manifest['version']} for ${file}; align them`,
        );
      }

      mut_versions.set(name, manifest['version']);
    }
  }

  return Object.fromEntries(mut_versions);
};

await main();
