import { collectPages } from '../../collect-pages.mjs';

/**
 * Every deployment branch policy `fetchPage` serves, read page by page.
 * `fetchPage` is given the page size to request; the loop ends at the first
 * page shorter than that. Kept apart from `getDeploymentBranchPolicies`, whose
 * client is built at import, so that the page loop can be tested with a reader
 * in place of the API.
 */
export const listDeploymentBranchPoliciesWith = async (
  fetchPage: (
    page: number,
    perPage: number,
  ) => Promise<readonly DeploymentBranchPolicy[]>,
): Promise<readonly DeploymentBranchPolicy[]> =>
  collectPages((page) => fetchPage(page, POLICIES_PER_PAGE), POLICIES_PER_PAGE);

export type DeploymentBranchPolicy = Readonly<{
  id: number;
  name: string;
  type: 'branch' | 'tag';
}>;

/** The `per_page` maximum of "List deployment branch policies". */
const POLICIES_PER_PAGE = 100;
