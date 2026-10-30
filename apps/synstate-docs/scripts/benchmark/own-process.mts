import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Arr, Num, Result } from 'ts-data-forge';

/**
 * Set in a child started by {@link measureEachInOwnProcess}:
 * `<the runner's pid>:<the index of the item the child measures>`.
 */
const ITEM_ENV = 'SYNSTATE_BENCHMARK_ITEM';

/**
 * The item index this process was started to measure, or `undefined` in the
 * runner that starts them. The pid is checked so that a value left in a shell
 * does not turn a runner into a child that writes no table.
 */
const childItemIndex: number | undefined = (() => {
  const [pid, index] = (process.env[ITEM_ENV] ?? '').split(':', 2);

  return index !== undefined && pid === process.ppid.toString()
    ? Result.unwrapOkOr(Num.safeParseInt(index), Number.NaN)
    : undefined;
})();

/** Whether this process measures one item for a runner (see below). */
export const isMeasuringChild: boolean = childItemIndex !== undefined;

/**
 * Measures each of `items` in a process of its own, and returns each item
 * with what `measure` returned for it, in order.
 *
 * V8 optimizes a function for the shapes it has seen, and what one row teaches
 * it carries into the next when they share a process. That is a cost of the
 * order, not of either row: with `Optional.some`'s `value` field optimized
 * for numbers by a row that stored only numbers, the next row, which stores an
 * observable, fell out of optimized code again and again and ran at a fifth
 * of its speed, so its figure depended on how the row before it was written.
 * A process per row measures each with nothing else run before it.
 *
 * The runner calls this once, with `import.meta.url`; each child runs the
 * same script (so its top level should print nothing it does not need, see
 * {@link isMeasuringChild}), reaches this call, measures its one item, sends
 * the result back and exits. `measure`'s result crosses the process boundary
 * by structured clone, and a child that exits otherwise (`process.exit(1)` on
 * a failed check) fails the runner.
 */
export const measureEachInOwnProcess = async <T, R>(
  scriptUrl: string,
  items: readonly T[],
  measure: (item: T) => R | Promise<R>,
): Promise<readonly (readonly [item: T, result: R])[]> => {
  if (childItemIndex !== undefined) {
    const item = items[childItemIndex];

    if (item === undefined) {
      throw new Error(`no item ${childItemIndex.toString()} to measure`);
    }

    const result = await measure(item);

    if (process.send === undefined) {
      throw new Error('a measuring process has no IPC channel to its runner');
    }

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

    // `process.exit` does not wait for a piped stdout; the progress lines
    // written before it would be lost.
    await new Promise<void>((resolve) => {
      process.stdout.write('', () => {
        resolve();
      });
    });

    process.exit(0);
  }

  const mut_results: (readonly [T, R])[] = [];

  for (const [index, item] of items.entries()) {
    mut_results.push([item, await runChild<R>(scriptUrl, index)]);
  }

  return mut_results;
};

/** Runs the script at `scriptUrl` to measure item `index`, and returns its result. */
const runChild = <R,>(scriptUrl: string, index: number): Promise<R> =>
  new Promise<R>((resolve, reject) => {
    // Every message the child sent: the result is the one, and anything else
    // fails the run rather than being taken for a result.
    const mut_messages: R[] = [];

    // `execArgv` is inherited, which carries the `tsx` loader along.
    const child = fork(fileURLToPath(scriptUrl), Arr.skip(process.argv, 2), {
      env: {
        ...process.env,
        [ITEM_ENV]: `${process.pid.toString()}:${index.toString()}`,
      },
      // Keeps `NaN`, `Infinity` and `undefined`, which JSON would make `null`,
      // and a `null` cell reads as a timeout.
      serialization: 'advanced',
    });

    child.on('message', (message) => {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      mut_messages.push(message as R);
    });

    child.on('error', reject);

    // `close` rather than `exit`, which can come before the last message.
    child.on('close', (code) => {
      if (code === 0 && Arr.isFixedLengthArray(1, mut_messages)) {
        resolve(mut_messages[0]);
      } else {
        reject(
          new Error(
            `the process measuring item ${index.toString()} exited with ${code?.toString() ?? 'a signal'} after ${mut_messages.length.toString()} messages`,
          ),
        );
      }
    });
  });
