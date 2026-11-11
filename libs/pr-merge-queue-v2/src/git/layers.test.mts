import { queueLayerOfMessage } from 'pr-report-core-v2';
import { Result } from 'ts-data-forge';
import {
  gitOk,
  makeRepository,
  type GitRepository,
} from '../../test/index.mjs';
import { buildLayers, deleteLayerBranch } from './layers.mjs';

/**
 * Branches `a` and `b`, each one commit on `main` (`b` two), changing `file` of
 * their own, or `shared` for a conflict.
 */
const twoBranches = async (
  repository: GitRepository,
  conflict: boolean,
): Promise<Readonly<{ base: string; a: string; b: string }>> => {
  const { cwd } = repository.place;

  const base = await repository.headOf('main');

  const a = await repository.commit(
    conflict ? 'shared.txt' : 'a.txt',
    'a\n',
    'a',
  );

  await repository.push(a, 'a');

  await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

  await repository.commit('b1.txt', 'b\n', 'b one');

  const b = await repository.commit(
    conflict ? 'shared.txt' : 'b2.txt',
    'b\n',
    'b two',
  );

  await repository.push(b, 'b');

  return { base, a, b };
};

const NO_LOG = (): void => {};

describe(buildLayers, () => {
  test('squashes each pull request onto the one below and pushes it with the trailer', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { base, a, b } = await twoBranches(repository, false);

    const built = await buildLayers(
      repository.place,
      {
        base,
        defaultBranch: 'main',
        layers: [
          { number: 1, head: a, branch: 'a', upstream: undefined },
          { number: 2, head: b, branch: 'b', upstream: undefined },
        ],
      },
      NO_LOG,
    );

    assert.deepStrictEqual(built, { built: [1, 2], failed: undefined });

    const { origin } = repository;

    const second = await gitOk(origin, ['rev-parse', 'queue/pr-2']);

    assert.strictEqual(
      await gitOk(origin, ['rev-parse', `${second}^`]),
      await gitOk(origin, ['rev-parse', 'queue/pr-1']),
    );

    assert.strictEqual(await gitOk(origin, ['rev-parse', 'queue/pr-1^']), base);

    assert.deepStrictEqual(
      queueLayerOfMessage(
        await gitOk(origin, ['log', '-1', '--format=%B', second]),
      ),
      { number: 2, head: b },
    );

    assert.strictEqual(
      await gitOk(origin, ['ls-tree', '--name-only', second]),
      ['a.txt', 'b1.txt', 'b2.txt', 'base.txt'].join('\n'),
    );
  });

  test("builds one stacked on another from that one's head, its commits alone", async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const base = await repository.headOf('main');

    const a = await repository.commit('a.txt', 'a\n', 'a');

    await repository.push(a, 'a');

    // `c` is stacked on `a`: it carries `a`'s commit below its own.
    const c = await repository.commit('c.txt', 'c\n', 'c');

    await repository.push(c, 'c');

    await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

    const built = await buildLayers(
      repository.place,
      {
        base,
        defaultBranch: 'main',
        layers: [
          { number: 1, head: a, branch: 'a', upstream: undefined },
          { number: 2, head: c, branch: 'c', upstream: a },
        ],
      },
      NO_LOG,
    );

    assert.deepStrictEqual(built, { built: [1, 2], failed: undefined });

    const { origin } = repository;

    assert.strictEqual(
      await gitOk(origin, ['rev-parse', 'queue/pr-2^']),
      await gitOk(origin, ['rev-parse', 'queue/pr-1']),
    );

    assert.strictEqual(
      await gitOk(origin, ['diff', '--name-only', 'queue/pr-2^', 'queue/pr-2']),
      'c.txt',
    );
  });

  test('stops at a layer whose commits conflict with the one below', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { base, a, b } = await twoBranches(repository, true);

    const built = await buildLayers(
      repository.place,
      {
        base,
        defaultBranch: 'main',
        layers: [
          { number: 1, head: a, branch: 'a', upstream: undefined },
          { number: 2, head: b, branch: 'b', upstream: undefined },
        ],
      },
      NO_LOG,
    );

    assert.deepStrictEqual(built.built, [1]);

    assert.isTrue(
      built.failed?.number === 2 && built.failed.why.includes('conflict'),
    );
  });

  test('fails a layer whose branch moved off the head it was read at', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { base } = await twoBranches(repository, false);

    const built = await buildLayers(
      repository.place,
      {
        base,
        defaultBranch: 'main',
        layers: [
          { number: 1, head: 'f'.repeat(40), branch: 'a', upstream: undefined },
        ],
      },
      NO_LOG,
    );

    assert.deepStrictEqual(built.built, []);

    assert.strictEqual(built.failed?.number, 1);
  });
});

describe(deleteLayerBranch, () => {
  test('deletes the branch on origin', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    await repository.push(await repository.headOf('main'), 'queue/pr-1');

    assert.deepStrictEqual(
      await deleteLayerBranch(repository.place.cwd, 'queue/pr-1'),
      Result.ok(undefined),
    );

    assert.strictEqual(
      await gitOk(repository.origin, ['branch', '--list', 'queue/pr-1']),
      '',
    );
  });
});
