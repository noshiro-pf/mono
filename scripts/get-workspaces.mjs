'use strict';

// @ts-check

import { execAsync } from './child-process-async.mjs';

/**
 * @returns {Promise<object>}
 */
const getWorkspacesObject = async () => {
  const result = await execAsync('yarn workspaces info --json');
  const workspacesStrOrNull = JSON.parse(result.stdout)?.data;
  if (workspacesStrOrNull == null) return {};
  const workspaces = JSON.parse(workspacesStrOrNull);
  if (workspaces == null) return {};

  return workspaces;
};

/**
 *
 * @returns {Promise<{
 *   name: string,
 *   location: string,
 *   workspaceDependencies: string[],
 *   mismatchedWorkspaceDependencies: string[]
 * }[]>}
 */
export const getWorkspaces = async () => {
  const workspaces = await getWorkspacesObject();
  const workspaceList = [...Object.entries(workspaces)];

  return workspaceList.map(([name, info]) => ({
    name,
    location: info?.location ?? '',
    workspaceDependencies: info?.workspaceDependencies ?? '',
    mismatchedWorkspaceDependencies:
      info?.mismatchedWorkspaceDependencies ?? '',
  }));
};
