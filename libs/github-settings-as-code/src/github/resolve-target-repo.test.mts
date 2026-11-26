// cspell:ignore unstub
import type { ReadonlyRecord } from 'ts-type-forge';
import { resolveTargetRepo } from './resolve-target-repo.mjs';

describe(resolveTargetRepo, () => {
  test('takes OWNER and REPO_NAME', async () => {
    await withEnv({ OWNER: 'someone', REPO_NAME: 'something' }, async () => {
      assert.deepStrictEqual(await resolveTargetRepo(), {
        owner: 'someone',
        repo: 'something',
      });
    });
  });

  test.each(['OWNER', 'REPO_NAME'] as const)(
    'refuses an empty %s, naming it, rather than falling through to origin',
    async (name) => {
      await withEnv(
        { OWNER: 'someone', REPO_NAME: 'something', [name]: '' },
        async () => {
          await expect(resolveTargetRepo()).rejects.toThrow(name);
        },
      );
    },
  );
});

/** Runs `run` with the environment variables `env` set, then restores them. */
const withEnv = async (
  env: ReadonlyRecord<string, string>,
  run: () => Promise<void>,
): Promise<void> => {
  for (const [name, value] of Object.entries(env)) {
    vi.stubEnv(name, value);
  }

  try {
    await run();
  } finally {
    vi.unstubAllEnvs();
  }
};
