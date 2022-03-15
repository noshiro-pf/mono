'use strict';

// @ts-check

const { execAsync } = require('./child-process-async');

/**
 * @returns {object | undefined}
 */
const getWorkspacesObject = async () => {
  const result = await execAsync('yarn workspaces info --json');
  const workspacesStrOrNull = JSON.parse(result.stdout)?.data;
  if (workspacesStrOrNull == null) return undefined;
  const workspaces = JSON.parse(workspacesStrOrNull);
  if (workspaces == null) return undefined;

  return workspaces;
};

/**
 *
 * @returns {{
 *   name: string,
 *   location: string,
 *   workspaceDependencies: string[],
 *   mismatchedWorkspaceDependencies: string[]
 * }[]}
 */
const getWorkspaces = async () => {
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

module.exports = { getWorkspaces };
