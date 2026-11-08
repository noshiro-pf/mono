import { createValueEmitter, fromPromise, mergeMap } from 'synstate-next';
import { Result } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('mergeMap', async () => {
    vi.useFakeTimers();

    try {
      const upload = async (name: string, delay: number): Promise<string> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(`${name} uploaded`);
          }, delay);
        });

      // embed-sample-code-ignore-above
      const [fileChosen, chooseFile] =
        createValueEmitter<Readonly<{ name: string; size: number }>>();

      // `upload(name, size)` stands for a request that takes longer for a bigger
      // file.
      // Every upload runs to the end, and each outcome is delivered, in the
      // order they come.
      const uploaded = fileChosen.pipe(
        mergeMap((file) => fromPromise(upload(file.name, file.size))),
      );

      const mut_done: string[] = [];

      uploaded.subscribe((result) => {
        if (Result.isOk(result)) {
          mut_done.push(result.value);
        }
      });

      chooseFile({ name: 'big.png', size: 300 });

      chooseFile({ name: 'small.png', size: 100 });

      await vi.advanceTimersByTimeAsync(500);

      assert.deepStrictEqual(mut_done, [
        'small.png uploaded',
        'big.png uploaded',
      ]);

      // embed-sample-code-ignore-below
    } finally {
      vi.useRealTimers();
    }
  });
}
