import { Result } from 'ts-data-forge';
import { executeLayerWork, type LayerWorld } from './layers.mjs';

describe(executeLayerWork, () => {
  test.each([false, true])(
    'falls back, building and dropping nothing, when a layer is not among the pull requests decided (dry run: %s)',
    async (dryRun) => {
      const mut_lines: string[] = [];

      const mut_built: number[] = [];

      const mut_deleted: string[] = [];

      const world: LayerWorld = {
        context: {
          transport: () => Promise.reject(new Error('no request expected')),
          owner: 'o',
          name: 'n',
          token: 'token',
        },
        dryRun,
        log: (line) => {
          mut_lines.push(line);
        },
        defaultBranch: 'main',
        buildLayers: (_base, _defaultBranch, layers) => {
          mut_built.push(...layers.map(({ number }) => number));

          return Promise.resolve({ built: [], failed: undefined });
        },
        deleteBranch: (branch) => {
          mut_deleted.push(branch);

          return Promise.resolve(Result.ok(undefined));
        },
      } as const;

      const done = await executeLayerWork(
        {
          drops: [
            {
              number: 5,
              branch: 'queue/pr-5',
              tip: 'b'.repeat(40),
              cancel: [],
              deleteRuns: [],
              deleteBranch: true,
            },
          ],
          build: {
            base: 'e'.repeat(40),
            onTip: false,
            layers: [{ number: 9, head: 'a'.repeat(40), upstream: undefined }],
          },
          dispatch: undefined,
        },
        () => undefined,
        world,
      );

      assert.strictEqual(done, 'fall-back');

      assert.deepStrictEqual(mut_built, []);

      assert.deepStrictEqual(mut_deleted, []);

      assert.isTrue(mut_lines.some((line) => line.includes('#9 is not among')));

      assert.isFalse(mut_lines.some((line) => /would/iu.test(line)));
    },
  );
});
