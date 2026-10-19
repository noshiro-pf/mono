import { Arr } from 'ts-data-forge';
import { commands } from 'vitest/browser';
import type { BenchApp, Framework } from './bench-app.mjs';
import {
  preactSignals,
  solid,
  synstateDom,
  vanjs,
} from './frameworks/index.mjs';

type Case = Readonly<{
  name: string;
  /** Brings the table to the state the operation starts from; not timed. */
  setup: (app: BenchApp) => void;
  /** The operation that is timed. */
  operation: (app: BenchApp) => void;
  iterations: number;
}>;

/** The operations of js-framework-benchmark, in its order. */
const cases: readonly Case[] = [
  {
    name: 'create 1,000 rows',
    setup: (app) => {
      app.clear();
    },
    operation: (app) => {
      app.run(1000);
    },
    iterations: 15,
  },
  {
    name: 'replace all 1,000 rows',
    setup: (app) => {
      app.run(1000);
    },
    operation: (app) => {
      app.run(1000);
    },
    iterations: 15,
  },
  {
    name: 'update every 10th of 1,000 rows',
    setup: (app) => {
      app.run(1000);
    },
    operation: (app) => {
      app.update();
    },
    iterations: 15,
  },
  {
    name: 'select a row',
    setup: (app) => {
      app.run(1000);
    },
    operation: (app) => {
      app.select(4);
    },
    iterations: 15,
  },
  {
    name: 'swap two rows',
    setup: (app) => {
      app.run(1000);
    },
    operation: (app) => {
      app.swapRows();
    },
    iterations: 15,
  },
  {
    name: 'remove a row',
    setup: (app) => {
      app.run(1000);
    },
    operation: (app) => {
      app.remove(4);
    },
    iterations: 15,
  },
  {
    name: 'create 10,000 rows',
    setup: (app) => {
      app.clear();
    },
    operation: (app) => {
      app.run(10_000);
    },
    iterations: 5,
  },
  {
    name: 'append 1,000 to 1,000 rows',
    setup: (app) => {
      app.run(1000);
    },
    operation: (app) => {
      app.add(1000);
    },
    iterations: 15,
  },
  {
    name: 'clear 1,000 rows',
    setup: (app) => {
      app.run(1000);
    },
    operation: (app) => {
      app.clear();
    },
    iterations: 15,
  },
] as const;

const frameworks: readonly Framework[] = [
  synstateDom,
  solid,
  preactSignals,
  vanjs,
] as const;

const warmups = 3;

type Result = Readonly<{ caseName: string; framework: string; ms: number }>;

test('js-framework-benchmark operations', async () => {
  const resultsByFramework = await mapInSequence(
    frameworks,
    async (framework) => {
      const container = document.createElement('div');

      document.body.append(container);

      const app = framework.mount(container);

      await verify(app, container).catch((error: unknown) => {
        throw new Error(`${framework.name} renders differently`, {
          cause: error,
        });
      });

      const timings = await mapInSequence(
        cases,
        async (c): Promise<Result> => ({
          caseName: c.name,
          framework: framework.name,
          ms: median(await measure(app, c, container)),
        }),
      );

      app.dispose();

      container.remove();

      return timings;
    },
  );

  const results = resultsByFramework.flat();

  assert.strictEqual(results.length, frameworks.length * cases.length);

  const table = toMarkdown(results);

  console.info(table);

  await commands.writeFile(
    'RESULTS.md',
    [
      '# Results',
      '',
      '<!-- Written by `pnpm run benchmark`; edits here are overwritten. -->',
      '',
      `Measured in \`${navigator.userAgent}\` with ${navigator.hardwareConcurrency} logical cores. Each figure is the median of the timed runs after ${warmups} warm-up runs; see README.md for what is timed.`,
      '',
      table,
      '',
    ].join('\n'),
  );
});

/** `Array#map` with an async callback, one element at a time. */
const mapInSequence = async <T, R>(
  items: readonly T[],
  fn: (item: T) => Promise<R>,
): Promise<readonly R[]> => {
  const [head, ...rest] = items;

  if (head === undefined) {
    return [];
  }

  const first = await fn(head);

  return Arr.toUnshifted(first)(await mapInSequence(rest, fn));
};

/**
 * Checks that an implementation renders what the others do, so that the
 * timings compare the same work.
 */
const verify = async (app: BenchApp, container: HTMLElement): Promise<void> => {
  const rows = (): readonly HTMLTableRowElement[] =>
    Array.from(container.querySelectorAll('tr'));

  const texts = (index: number): readonly string[] =>
    Array.from(rows()[index]?.cells ?? [], (cell) => cell.textContent);

  app.run(1000);

  await settle(container);

  assert.strictEqual(rows().length, 1000);

  const second = texts(1);

  const secondToLast = texts(998);

  app.update();

  app.select(4);

  app.swapRows();

  await settle(container);

  assert.isTrue(texts(0)[1]?.endsWith(' !!!') === true);

  assert.strictEqual(rows()[4]?.className, 'danger');

  assert.deepStrictEqual(texts(1), secondToLast);

  assert.deepStrictEqual(texts(998), second);

  app.remove(4);

  app.add(1000);

  await settle(container);

  assert.strictEqual(rows().length, 1999);

  app.clear();

  await settle(container);

  assert.strictEqual(rows().length, 0);
};

const measure = async (
  app: BenchApp,
  c: Case,
  container: HTMLElement,
): Promise<readonly number[]> => {
  const samples = await mapInSequence(
    Array.from({ length: warmups + c.iterations }, (_, i) => i),
    async () => {
      c.setup(app);

      await settle(container);

      const start = performance.now();

      c.operation(app);

      await settle(container);

      return performance.now() - start;
    },
  );

  return samples.slice(warmups);
};

/**
 * Waits for one macrotask, which lets VanJS's `setTimeout` and Preact's
 * microtask render run, then forces layout. Every implementation pays the
 * same wait, so it shifts the timings equally rather than favouring the ones
 * that update synchronously.
 */
const settle = async (container: HTMLElement): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

  // Reading the geometry makes the browser lay the table out now.
  container.getBoundingClientRect();
};

const median = (samples: readonly number[]): number => {
  const sorted = samples.toSorted((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? (sorted[mid] ?? Number.NaN)
    : ((sorted[mid - 1] ?? Number.NaN) + (sorted[mid] ?? Number.NaN)) / 2;
};

const toMarkdown = (results: readonly Result[]): string => {
  const cell = (caseName: string, framework: string): string =>
    (
      results.find((r) => r.caseName === caseName && r.framework === framework)
        ?.ms ?? Number.NaN
    ).toFixed(2);

  return [
    `| operation (median ms) | ${frameworks.map((f) => f.name).join(' | ')} |`,
    `| :-- | ${frameworks.map(() => '--:').join(' | ')} |`,
    ...cases.map(
      (c) =>
        `| ${c.name} | ${frameworks.map((f) => cell(c.name, f.name)).join(' | ')} |`,
    ),
  ].join('\n');
};
