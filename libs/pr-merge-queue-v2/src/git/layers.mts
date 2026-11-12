// cspell:ignore gpgsign
/**
 * Building and deleting the `queue/pr-<N>` layers (`spec/worker.md`, "Checking
 * ahead"): each candidate's commits since its merge base with the default
 * branch, squashed into one commit on the layer below, with the `Queue-Layer:`
 * trailer, force-pushed to its own branch.
 */

import { layerMessage, queueLayerBranchOf } from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import { fetchCommits, withWorktree, type GitPlace } from './git.mjs';
import { git } from './run.mjs';
import { lastLines } from './shell.mjs';

/**
 * Builds `layers` one on another from `base` in a throwaway worktree, and
 * pushes each to its branch. Stops at the first that cannot be built — its head
 * moved, or its commits conflict with the layers below — since everything above
 * it would carry it: the numbers built, and the one that failed, with why.
 */
export const buildLayers = async (
  place: GitPlace,
  build: Readonly<{
    base: string;
    defaultBranch: string;
    layers: readonly LayerToBuild[];
  }>,
  log: (line: string) => void,
): Promise<BuiltLayers> => {
  const [first] = build.layers;

  if (first === undefined) {
    return { built: [], failed: undefined };
  }

  // The default branch's remote-tracking ref is named, not left to
  // `remote.origin.fetch`: a layer's merge base is read from it.
  const fetched = await git(place.cwd, [
    'fetch',
    '--quiet',
    'origin',
    `+refs/heads/${build.defaultBranch}:refs/remotes/origin/${build.defaultBranch}`,
    ...build.layers.map(({ branch }) => `refs/heads/${branch}`),
  ]);

  if (Result.isErr(fetched)) {
    return {
      built: [],
      failed: { number: first.number, why: `cannot fetch: ${fetched.value}` },
    };
  }

  const done = await withWorktree<BuiltLayers>(
    place,
    'speculate',
    first.number,
    build.base,
    async (worktree) => {
      const mut_built: number[] = [];

      for (const layer of build.layers) {
        // eslint-disable-next-line no-await-in-loop -- each on the one below
        const built = await buildLayer(
          place.cwd,
          worktree,
          layer,
          build.defaultBranch,
        );

        if (Result.isErr(built)) {
          return Result.ok({
            built: mut_built,
            failed: { number: layer.number, why: built.value },
          });
        }

        log(
          `#${layer.number}: stacked on ${queueLayerBranchOf(layer.number)} (${built.value.slice(0, 10)}).`,
        );

        mut_built.push(layer.number);
      }

      return Result.ok({ built: mut_built, failed: undefined });
    },
  );

  return Result.isErr(done)
    ? { built: [], failed: { number: first.number, why: done.value } }
    : done.value;
};

/** Deletes the layer branch `branch` on `origin`. */
export const deleteLayerBranch = async (
  cwd: string,
  branch: string,
): Promise<Result<undefined, string>> =>
  Result.map(
    await git(cwd, ['push', '--quiet', 'origin', '--delete', branch]),
    () => undefined,
  );

/**
 * A layer to build: the pull request, its head, the branch it is on, and the
 * commit its own commits come after when that is not its merge base with the
 * default branch (`desiredLayers` in `pr-report-core-v2`).
 */
export type LayerToBuild = Readonly<{
  number: number;
  head: string;
  branch: string;
  upstream: string | undefined;
}>;

export type BuiltLayers = Readonly<{
  built: readonly number[];
  failed: Readonly<{ number: number; why: string }> | undefined;
}>;

/**
 * One layer on `HEAD` of `worktree`: the commits `layer.head` has since its
 * `upstream`, or else its merge base with the default branch, oldest first and
 * merges left out, as the release's rebase replays them, so that the layer's
 * tree is the one its head will have once rebased. The commit pushed.
 */
const buildLayer = async (
  cwd: string,
  worktree: string,
  layer: LayerToBuild,
  defaultBranch: string,
): Promise<Result<string, string>> => {
  // The head the snapshot read, which the fetch of its branch brought unless
  // the branch has moved off it since.
  const present = await git(worktree, [
    'cat-file',
    '-e',
    [layer.head, '^{commit}'].join(''),
  ]);

  if (Result.isErr(present)) {
    return Result.err('its branch has moved off the head it was read at');
  }

  // One stacked on another pull request from that one's head, which the layer
  // below already carries; any other from its merge base with the default
  // branch. A head GitHub keeps no branch for is fetched by itself.
  if (layer.upstream !== undefined) {
    const upstream = await fetchCommits(cwd, [layer.upstream]);

    if (Result.isErr(upstream)) {
      return Result.err(
        `cannot fetch the head it is stacked on: ${lastLines(upstream.value, 5)}`,
      );
    }
  }

  const mergeBase = await git(worktree, [
    'merge-base',
    layer.upstream ?? `refs/remotes/origin/${defaultBranch}`,
    layer.head,
  ]);

  if (Result.isErr(mergeBase)) {
    return Result.err(`cannot find its merge base: ${mergeBase.value}`);
  }

  const commits = await git(worktree, [
    'rev-list',
    '--reverse',
    '--no-merges',
    `${mergeBase.value.trim()}..${layer.head}`,
  ]);

  if (Result.isErr(commits)) {
    return Result.err(`cannot list its commits: ${commits.value}`);
  }

  const shas = commits.value.split('\n').filter((line) => line !== '');

  const picked = Arr.isNonEmpty(shas)
    ? await git(worktree, ['cherry-pick', '--no-commit', ...shas])
    : Result.ok('');

  if (Result.isErr(picked)) {
    return Result.err(
      `its commits conflict with the layers below it: ${lastLines(picked.value, 5)}`,
    );
  }

  const committed = await git(worktree, [
    '-c',
    'commit.gpgsign=false',
    'commit',
    '--quiet',
    '--allow-empty',
    '--no-verify',
    '-m',
    layerMessage(layer),
  ]);

  if (Result.isErr(committed)) {
    return Result.err(`cannot commit it: ${lastLines(committed.value, 5)}`);
  }

  const tip = await git(worktree, ['rev-parse', 'HEAD']);

  if (Result.isErr(tip)) {
    return tip;
  }

  const sha = tip.value.trim();

  const pushed = await git(cwd, [
    'push',
    '--quiet',
    '--force',
    'origin',
    `${sha}:refs/heads/${queueLayerBranchOf(layer.number)}`,
  ]);

  return Result.isErr(pushed)
    ? Result.err(`cannot push it: ${lastLines(pushed.value, 5)}`)
    : Result.ok(sha);
};
