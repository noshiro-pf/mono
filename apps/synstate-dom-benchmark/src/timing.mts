import { Arr } from 'ts-data-forge';

/** How many runs of each operation are discarded before the timed ones. */
export const warmups = 3;

/**
 * How many changes one sample of a sub-millisecond operation times, one after
 * another; the sample is their mean. A single such change is close to the 0.1
 * ms to which the browser rounds `performance.now()`.
 */
export const changesPerSample = 20;

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

export const median = (samples: readonly number[]): number => {
  const sorted = samples.toSorted((a, b) => a - b);

  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 1
    ? (sorted[mid] ?? Number.NaN)
    : ((sorted[mid - 1] ?? Number.NaN) + (sorted[mid] ?? Number.NaN)) / 2;
};

/**
 * Waits for the next task, then forces layout, which ends every timed change.
 * VanJS and Preact render in a microtask and the others synchronously, so every
 * library has rendered by then.
 *
 * The task is a `MessageChannel` message rather than a `setTimeout`: the
 * browser holds a `setTimeout` back to 4 ms once timeouts are nested, as they
 * are when samples are taken one after another, and several of the operations
 * cost less than that.
 */
export const settle = async (container: HTMLElement): Promise<void> => {
  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();

    channel.port1.addEventListener('message', () => {
      channel.port1.close();

      resolve();
    });

    channel.port1.start();

    channel.port2.postMessage(undefined);
  });

  // Reading the geometry makes the browser lay the table out now.
  container.getBoundingClientRect();
};
