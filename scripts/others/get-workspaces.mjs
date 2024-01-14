import { execAsync } from '../node-utils/child-process-async.mjs';
import { isRecord, isString } from '../ts-utils/guard.mjs';

/**
 * @typedef {Readonly<{
 *   name: string,
 *   location: string,
 *   workspaceDependencies: readonly string[],
 *   mismatchedWorkspaceDependencies: readonly string[],
 * }>} Workspace
 */

/**
 * @returns {Promise<readonly Workspace[]>}
 */
export const getWorkspaces = async () => {
  const result = await execAsync('yarn workspaces info --json');

  const parsed = JSON.parse(result.stdout);
  if (!isRecord(parsed) || !Object.hasOwn(parsed, 'data')) {
    return [];
  }

  const workspacesStrOrNull = parsed.data;
  if (typeof workspacesStrOrNull !== 'string') return [];

  const workspaces = JSON.parse(workspacesStrOrNull);
  if (!isRecord(workspaces)) return [];

  return Array.from(Object.entries(workspaces), ([name, info]) => ({
    name,

    location:
      isRecord(info) &&
      Object.hasOwn(info, 'location') &&
      isString(info.location)
        ? info.location
        : '',

    workspaceDependencies:
      isRecord(info) &&
      Object.hasOwn(info, 'workspaceDependencies') &&
      Array.isArray(info.workspaceDependencies) &&
      info.workspaceDependencies.every(isString)
        ? info.workspaceDependencies
        : [],

    mismatchedWorkspaceDependencies:
      isRecord(info) &&
      Object.hasOwn(info, 'mismatchedWorkspaceDependencies') &&
      Array.isArray(info.mismatchedWorkspaceDependencies) &&
      info.mismatchedWorkspaceDependencies.every(isString)
        ? info.mismatchedWorkspaceDependencies
        : [],
  }));
};
