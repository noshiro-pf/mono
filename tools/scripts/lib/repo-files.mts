/** The files of the repository that more than one guard reads, by kind. */

import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { glob } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/** Where the workflows are, relative to the repository root. */
export const WORKFLOW_GLOB = '.github/workflows/*.yml';

/**
 * Every workflow file, absolute and sorted. A composite action under
 * `.github/actions/` is not a workflow and is not listed.
 */
export const listWorkflowFiles = async (): Promise<
  Result<readonly string[], string>
> => listSorted(WORKFLOW_GLOB);

/** The directory of every published package (`libs/*`), absolute and sorted. */
export const listLibraryDirs = async (): Promise<
  Result<readonly string[], string>
> =>
  Result.map(await listSorted('libs/*/package.json'), (manifests) =>
    manifests.map(path.dirname),
  );

const listSorted = async (
  pattern: string,
): Promise<Result<readonly string[], string>> => {
  const result = await glob(pattern, {
    cwd: projectRootPath,
    absolute: true,
  });

  return Result.isErr(result)
    ? Result.err(`Failed to list ${pattern}: ${unknownToString(result.value)}`)
    : Result.ok(result.value.toSorted());
};
