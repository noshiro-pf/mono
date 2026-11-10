import { execFile, type PromiseWithChild } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as util from 'node:util';
import type { Observable as SynstateObservable } from 'synstate';
import type { Observable as NextObservable } from 'synstate-next';
import {
  Arr,
  asSafeInt,
  hasKey,
  isRecord,
  Num,
  range,
  unknownToString,
} from 'ts-data-forge';
import type { NonEmptyTuple } from 'ts-type-forge';

// The libraries themselves are imported in `loadLibrary`, so that a process
// loads only the one it measures.

/**
 * Compares synstate-next with synstate, the package it is to replace, on the
 * graphs a state library spends its time in, and writes the medians to
 * BENCHMARK.md.
 *
 * ```sh
 * pnpm run ws:build      # both are imported from dist/
 * cd libs/synstate-next
 * pnpm run benchmark     # then Prettier aligns the tables in BENCHMARK.md
 * ```
 *
 * Each scenario runs {@link processes} times per library, each time in a
 * process of its own, so that neither library's code is compiled with the
 * other's shapes in view and one process's luck with the JIT or the collector
 * does not decide the figure, and in production mode (`NODE_ENV=production`),
 * as an application ships it. Nothing here runs in CI: timings from a shared
 * runner say little.
 */
const main = async (): Promise<void> => {
  const scenarioName = process.argv[2];

  const libraryName = process.argv[3];

  if (scenarioName !== undefined && libraryName !== undefined) {
    await measureInThisProcess(scenarioName, libraryName);

    return;
  }

  const mut_rows: string[] = [];

  for (const scenario of scenarios) {
    // The libraries alternate, and which goes first turns from round to round,
    // so that a slow stretch of the machine falls on both.
    // One process at a time: two measured at once would share the machine.
    const mut_runs: (readonly (readonly [LibraryName, number])[])[] = [];

    for (const round of range(0, asSafeInt(processes))) {
      const mut_run: (readonly [LibraryName, number])[] = [];

      for (const library of round % 2 === 0
        ? libraryNames
        : libraryNames.toReversed()) {
        mut_run.push([library, await measureInChild(scenario.name, library)]);
      }

      mut_runs.push(mut_run);
    }

    const runs: readonly (readonly (readonly [LibraryName, number])[])[] =
      mut_runs;

    const [synstateNs, nextNs] = libraryNames.map((library) =>
      median(
        runs.flatMap((run) =>
          Arr.generate(function* () {
            for (const [name, ns] of run) {
              if (name === library) {
                yield ns;
              }
            }
          }),
        ),
      ),
    );

    console.info(
      `${scenario.name}: synstate ${format(synstateNs)} ns, synstate-next ${format(nextNs)} ns`,
    );

    mut_rows.push(
      `| ${scenario.name} | ${format(synstateNs)} | ${format(nextNs)} | ${ratio(nextNs, synstateNs)} |`,
    );
  }

  const markdown = [
    '# Benchmark: synstate-next and synstate',
    '',
    '<!-- Written by `pnpm run benchmark`; edits here are overwritten. -->',
    '',
    `Measured with Node.js ${process.version} on ${os.cpus()[0]?.model ?? 'an unknown CPU'}. Each figure is the median time of one operation, in nanoseconds, of ${processes} processes per library, each the median of ${samples} samples after ${warmupSamples} warm-up samples; see \`scripts/cmd/benchmark.mts\` for the scenarios. The last column is synstate-next's time divided by synstate's: below 1 is faster than synstate, above 1 slower.`,
    '',
    '| scenario (median ns per operation) | synstate | synstate-next | synstate-next / synstate |',
    '| :-- | --: | --: | --: |',
    ...mut_rows,
    '',
  ].join('\n');

  await fs.writeFile(resultsFile, markdown);

  console.info('Wrote BENCHMARK.md');
};

/**
 * What a scenario needs of a library, written once for both: their APIs differ
 * only in how a state is made and written and how a subscription ends.
 */
type Library = Readonly<{
  state: (initial: number) => Readonly<{
    node: unknown;
    set: (value: number) => void;
  }>;
  map: (node: unknown, fn: (value: number) => number) => unknown;
  derive: (
    parents: readonly unknown[],
    fn: (...values: readonly number[]) => number,
  ) => unknown;
  subscribe: (node: unknown, fn: (value: number) => void) => () => void;
  /** Runs `fn` in a new scope or owner, and returns the function disposing it. */
  owned: (fn: () => void) => () => void;
}>;

type Scenario = Readonly<{
  name: string;
  /** The operations one sample times. */
  operations: number;
  /**
   * Builds what the scenario updates, and returns the operation that is timed,
   * called with the operation's number.
   */
  setup: (library: Library) => (i: number) => void;
}>;

/** The processes that measure each scenario with each library. */
const processes = 6;

const samples = 21;

const warmupSamples = 10;

const libraryNames = ['synstate', 'synstate-next'] as const;

type LibraryName = (typeof libraryNames)[number];

const execFileAsync = util.promisify(execFile);

/**
 * Closes the stdin of the process `util.promisify(execFile)` started and
 * returns the same promise. The promisified `execFile` leaves stdin an open
 * pipe, where `execFileSync` closed it at once: a process that reads it would
 * wait for input that never comes.
 */
const closingStdin = <T,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a ChildProcess, whose stdin is ended here
  running: PromiseWithChild<T>,
): PromiseWithChild<T> => {
  running.child.stdin?.end();

  return running;
};

const thisFile = import.meta.filename;

/** BENCHMARK.md, at the root of this package. */
const resultsFile = path.resolve(import.meta.dirname, '../../BENCHMARK.md');

const scenarios: readonly Scenario[] = [
  {
    name: 'write a state with one subscriber',
    operations: 10_000,
    setup: (library) => {
      const a = library.state(0);

      library.subscribe(a.node, sink);

      return (i) => {
        a.set(i + 1);
      };
    },
  },
  {
    name: 'a chain of 100 maps',
    operations: 1000,
    setup: (library) => {
      const a = library.state(0);

      library.subscribe(chain(library, a.node, 100), sink);

      return (i) => {
        a.set(i + 1);
      };
    },
  },
  {
    name: 'a diamond: two maps joined by derive',
    operations: 10_000,
    setup: (library) => {
      const a = library.state(0);

      const b = library.map(a.node, (x) => x + 1);

      const c = library.map(a.node, (x) => x * 2);

      library.subscribe(
        library.derive([b, c], (x = 0, y = 0) => x + y),
        sink,
      );

      return (i) => {
        a.set(i + 1);
      };
    },
  },
  {
    name: '50 diamonds in a row',
    operations: 1000,
    setup: (library) => {
      const a = library.state(0);

      const tail = Array.from({ length: 50 }).reduce<unknown>((node) => {
        const left = library.map(node, (x) => x + 1);

        const right = library.map(node, (x) => x - 1);

        return library.derive([left, right], (x = 0, y = 0) => (x + y) / 2);
      }, a.node);

      library.subscribe(tail, sink);

      return (i) => {
        a.set(i + 1);
      };
    },
  },
  {
    name: 'one state read by 1,000 subscribed maps',
    operations: 300,
    setup: (library) => {
      const a = library.state(0);

      for (const k of range(0, asSafeInt(1000))) {
        library.subscribe(
          library.map(a.node, (x) => x + k),
          sink,
        );
      }

      return (i) => {
        a.set(i + 1);
      };
    },
  },
  {
    name: 'a write cut off after the first map, before 100 more',
    operations: 10_000,
    setup: (library) => {
      const a = library.state(0);

      // Every write gives the same parity of 2 * i: the chain after it is not
      // reached.
      const parity = library.map(a.node, (x) => x % 2);

      library.subscribe(chain(library, parity, 100), sink);

      return (i) => {
        a.set(2 * (i + 1));
      };
    },
  },
  {
    name: 'write a state that a chain of 10 maps reads, unsubscribed',
    operations: 10_000,
    setup: (library) => {
      const a = library.state(0);

      chain(library, a.node, 10);

      return (i) => {
        a.set(i + 1);
      };
    },
  },
  {
    name: 'create and dispose a state, 10 maps and a subscriber',
    operations: 1000,
    setup: (library) => () => {
      const dispose = library.owned(() => {
        const a = library.state(0);

        library.subscribe(chain(library, a.node, 10), sink);

        a.set(1);
      });

      dispose();
    },
  },
] as const;

/** Keeps what the subscribers receive alive, so that nothing is optimized out. */
const mut_received = { last: 0 };

const sink = (value: number): void => {
  mut_received.last = value;
};

/** A chain of `length` maps from `head`. */
const chain = (library: Library, head: unknown, length: number): unknown =>
  Array.from({ length }).reduce<unknown>(
    (node) => library.map(node, (x) => x + 1),
    head,
  );

const loadLibrary = async (name: string): Promise<Library> => {
  if (name === 'synstate') {
    const synstate = await import('synstate');

    return {
      state: (initial) => {
        const [node, set] = synstate.createState(initial);

        return { node, set };
      },
      map: (node, fn) =>
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `state`, `map` and `derive` returned
        (node as SynstateObservable<number>).pipe(synstate.map(fn)),
      derive: (parents, fn) =>
        synstate.derive(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `state`, `map` and `derive` returned; never empty here
          parents as unknown as NonEmptyTuple<SynstateObservable<number>>,
          fn,
        ),
      subscribe: (node, fn) => {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `state`, `map` and `derive` returned
        const subscription = (node as SynstateObservable<number>).subscribe(fn);

        return () => {
          subscription.unsubscribe();
        };
      },
      owned: (fn) => {
        const scope = synstate.createScope();

        scope.run(fn);

        return () => {
          scope.dispose();
        };
      },
    };
  }

  if (name !== 'synstate-next') {
    throw new Error(`no library named ${name}`);
  }

  const next = await import('synstate-next');

  return {
    state: (initial) => {
      const node = next.state(initial);

      return {
        node,
        set: (value) => {
          node.set(value);
        },
      };
    },
    map: (node, fn) =>
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `state`, `map` and `derive` returned
      (node as NextObservable<number>).pipe(next.map(fn)),
    derive: (parents, fn) =>
      next.derive(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `state`, `map` and `derive` returned
        parents as readonly NextObservable<number>[],
        fn,
      ),
    subscribe: (node, fn) =>
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- what `state`, `map` and `derive` returned
      (node as NextObservable<number>).subscribe(fn),
    owned: (fn) => {
      const owner = next.createOwner();

      owner.run(fn);

      return () => {
        owner.dispose();
      };
    },
  };
};

/** The middle of an odd number of values. */
const median = (values: readonly number[]): number | undefined =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

/** Measures one scenario with one library, and prints the median in ns. */
const measureInThisProcess = async (
  scenarioName: string,
  libraryName: string,
): Promise<void> => {
  const scenario = scenarios.find((s) => s.name === scenarioName);

  if (scenario === undefined) {
    throw new Error(`no scenario named ${scenarioName}`);
  }

  const operation = scenario.setup(await loadLibrary(libraryName));

  const operations = asSafeInt(scenario.operations);

  if (!Num.isNonZero(operations)) {
    throw new Error(`${scenarioName} times no operation`);
  }

  const mut_counter = { next: 0 };

  /** Times one sample, and returns the mean time of its operations in ns. */
  const timeSample = (): number => {
    const start = performance.now();

    // A counted loop, not `range`: a generator's step would be timed with each
    // operation, and at tens of nanoseconds that is not small.
    // eslint-disable-next-line ts-data-forge/prefer-range-for-loop
    for (let mut_k = 0; mut_k < operations; mut_k += 1) {
      operation(mut_counter.next);

      mut_counter.next += 1;
    }

    return Num.div((performance.now() - start) * 1e6, operations);
  };

  for (const _ of range(0, asSafeInt(warmupSamples))) {
    timeSample();
  }

  const times = Array.from({ length: samples }, timeSample);

  console.info(
    JSON.stringify({
      median: median(times),
      received: mut_received.last,
    }),
  );
};

/** `text` parsed as JSON, or `undefined` when it is not JSON. */
const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

/** Runs one scenario with one library in a new process, and reads its median. */
const measureInChild = async (
  scenarioName: string,
  libraryName: string,
): Promise<number> => {
  // Plain Node.js, which strips this file's types itself, and never tsx, which
  // would map `ts-data-forge` and `ts-std-forge`, imported by both libraries'
  // `dist/`, to their TypeScript sources through the repository's `paths`.
  const { TSX_TSCONFIG_PATH: _, ...env } = process.env;

  // A failure rejects with an error whose message holds the child's stderr.
  const { stdout } = await closingStdin(
    execFileAsync(process.execPath, [thisFile, scenarioName, libraryName], {
      env: { ...env, NODE_ENV: 'production' },
      encoding: 'utf8',
    }),
  ).catch((error: unknown) => {
    throw new Error(
      `${scenarioName} with ${libraryName} failed:\n${unknownToString(error)}`,
    );
  });

  const lastLine = stdout.trim().split('\n').at(-1) ?? '';

  const parsed = parseJson(lastLine);

  if (
    !isRecord(parsed) ||
    !hasKey(parsed, 'median') ||
    typeof parsed.median !== 'number'
  ) {
    throw new Error(`unexpected output from ${scenarioName}: ${lastLine}`);
  }

  return parsed.median;
};

const format = (ns: number | undefined): string =>
  ns === undefined ? '?' : ns < 100 ? ns.toFixed(1) : Math.round(ns).toString();

const ratio = (
  numerator: number | undefined,
  denominator: number | undefined,
): string =>
  numerator === undefined ||
  denominator === undefined ||
  !Num.isNonZero(denominator)
    ? '?'
    : (`${Num.div(numerator, denominator).toFixed(2)}×` as const);

await main();
