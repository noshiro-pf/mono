import { Arr } from 'ts-data-forge';
import {
  mapInSequence,
  median,
  rotated,
  settleUnclamped as settle,
  warmups,
} from '../timing.mjs';
import type {
  Cells,
  Scenario,
  ScenarioAppBase,
  ScenarioFramework,
} from './scenario.mjs';

/**
 * A timing, or `undefined` when the library rendered something other than
 * what the model computes: a time for the wrong figures is not one to
 * compare.
 */
export type ScenarioResult = Readonly<{
  operation: string;
  framework: string;
  ms: number | undefined;
}>;

/** How many samples each operation's median is taken over. */
const samples = 15;

/**
 * How many changes one sample times, alternating a case's `apply` and
 * `revert`, and how many mounts a build sample times. A single change of these
 * graphs takes well under a millisecond, close to the 0.1 ms to which the
 * browser rounds `performance.now()`; a sample is their mean.
 */
const changesPerSample = 20;

const buildsPerSample = 5;

/**
 * Measures every operation of `scenario` with every library: first `mount`,
 * which builds the whole graph, then each case on a screen mounted for it, so
 * that what a case renders depends on that case alone.
 */
export const measureScenario = async <App extends ScenarioAppBase>(
  scenario: Scenario<App>,
): Promise<readonly ScenarioResult[]> => {
  const resultsByFramework = await mapInSequence(
    rotated(scenario.frameworks),
    async (framework) => {
      const container = document.createElement('div');

      document.body.append(container);

      const build = await measureBuild(scenario, framework, container);

      const timings = await mapInSequence(
        scenario.cases,
        async (c): Promise<ScenarioResult> => {
          const app = framework.mount(container);

          await settle(container);

          const timed = await mapInSequence(
            range(warmups + samples),
            async () => {
              const start = performance.now();

              await mapInSequence(range(changesPerSample), async (i) => {
                if (i % 2 === 0) {
                  c.apply(app);
                } else {
                  c.revert(app);
                }

                await settle(container);
              });

              return (performance.now() - start) / changesPerSample;
            },
          );

          c.apply(app);

          await settle(container);

          const correct = sameCells(cellsOf(container), c.expected);

          app.dispose();

          return {
            operation: c.name,
            framework: framework.name,
            ms: correct ? median(timed.slice(warmups)) : undefined,
          };
        },
      );

      container.remove();

      return Arr.toUnshifted(build)(timings);
    },
  );

  return resultsByFramework.flat();
};

/** `0, 1, …, count - 1`. */
const range = (count: number): readonly number[] =>
  Array.from({ length: count }, (_, i) => i);

const cellsOf = (container: HTMLElement): Cells =>
  Array.from(container.querySelectorAll('tr'), (row) =>
    Array.from(row.cells, (cell) => cell.textContent),
  );

const sameCells = (actual: Cells, expected: Cells): boolean =>
  actual.length === expected.length &&
  actual.every(
    (row, i) =>
      row.length === expected[i]?.length &&
      row.every((text, j) => text === expected[i]?.[j]),
  );

/** Times `mount` until the screen is laid out, and checks what it shows. */
const measureBuild = async <App extends ScenarioAppBase>(
  scenario: Scenario<App>,
  framework: ScenarioFramework<App>,
  container: HTMLElement,
): Promise<ScenarioResult> => {
  const runs = await mapInSequence(range(warmups + samples), async () => {
    const builds = await mapInSequence(range(buildsPerSample), async () => {
      await settle(container);

      const start = performance.now();

      const app = framework.mount(container);

      await settle(container);

      const ms = performance.now() - start;

      const correct = sameCells(cellsOf(container), scenario.initial);

      app.dispose();

      return { ms, correct } as const;
    });

    return {
      ms: builds.reduce((total, b) => total + b.ms, 0) / buildsPerSample,
      correct: builds.every((b) => b.correct),
    } as const;
  });

  const timed = runs.slice(warmups);

  return {
    operation: scenario.buildName,
    framework: framework.name,
    ms: timed.every((run) => run.correct)
      ? median(timed.map((run) => run.ms))
      : undefined,
  };
};
