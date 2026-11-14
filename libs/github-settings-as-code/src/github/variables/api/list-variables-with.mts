import type { DeepReadonly } from 'ts-type-forge';
import { collectPages } from '../../collect-pages.mjs';

/**
 * Every repository variable `fetchPage` serves, read page by page, sorted by
 * name. `fetchPage` is given the page size to request; the loop ends at the
 * first page shorter than that. Kept apart from `listRepoVariables`, whose
 * client is built at import, so that the page loop can be tested with a reader
 * in place of the API.
 */
export const listVariablesWith = async (
  fetchPage: (
    page: number,
    perPage: number,
  ) => Promise<readonly RepoVariable[]>,
): Promise<readonly RepoVariable[]> => {
  // Pages are read by offset: a variable created or deleted between two
  // requests can be read twice or missed. Nothing here detects that.
  const variables = await collectPages(
    (page) => fetchPage(page, VARIABLES_PER_PAGE),
    VARIABLES_PER_PAGE,
  );

  // 名前順に整えて返す。宣言ファイルの中身が API の返す順に左右されると、値が
  // 変わっていない日にも diff が出る。
  return variables.toSorted((a, b) => a.name.localeCompare(b.name));
};

export type RepoVariable = DeepReadonly<{
  name: string;
  value: string;
  created_at: string;
  updated_at: string;
}>;

/**
 * The `per_page` maximum of "List repository variables" (its default is 10).
 * Asking for more than the endpoint gives would stop `collectPages` after the
 * first page, which comes back shorter than asked.
 */
const VARIABLES_PER_PAGE = 30;
