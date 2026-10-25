import { Arr } from 'ts-data-forge';

/** How many runs of each operation are discarded before the timed ones. */
export const warmups = 3;

/**
 * `items` turned left by `BENCHMARK_ROTATE` (set by
 * `pnpm run benchmark:repeat`), so that over several runs each library is
 * measured first in turn. The tables keep the order of `items`.
 */
export const rotated = <T,>(items: readonly T[]): readonly T[] => {
  const shift = Number(process.env['BENCHMARK_ROTATE']) % items.length;

  return [...items.slice(shift), ...items.slice(0, shift)];
};

/** `Array#map` with an async callback, one element at a time. */
export const mapInSequence = async <T, R>(
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
 * Waits for one macrotask, which lets VanJS's and Preact's microtask renders
 * run, then forces layout. Every implementation pays the
 * same wait, so it shifts the timings equally rather than favouring the ones
 * that update synchronously.
 */
export const settle = async (container: HTMLElement): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

  // Reading the geometry makes the browser lay the table out now.
  container.getBoundingClientRect();
};

export const median = (samples: readonly number[]): number => {
  const sorted = samples.toSorted((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? (sorted[mid] ?? Number.NaN)
    : ((sorted[mid - 1] ?? Number.NaN) + (sorted[mid] ?? Number.NaN)) / 2;
};

/**
 * Like {@link settle}, but waits for the next task through a `MessageChannel`
 * rather than a `setTimeout`, which the browser holds back to 4 ms once
 * timeouts are nested. Every library here has rendered by then: VanJS and
 * Preact render in a microtask, the others synchronously. The scenarios use
 * it, because a change there costs less than that 4 ms.
 */
export const settleUnclamped = async (
  container: HTMLElement,
): Promise<void> => {
  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();

    channel.port1.addEventListener('message', () => {
      channel.port1.close();

      resolve();
    });

    channel.port1.start();

    channel.port2.postMessage(undefined);
  });

  container.getBoundingClientRect();
};
