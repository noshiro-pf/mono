/**
 * Every item of a paginated list, page by page from 1, until a page comes back
 * shorter than `perPage`. A list read one page at a time misses everything past
 * the first page, silently.
 */
export const collectPages = async <T,>(
  fetchPage: (page: number) => Promise<readonly T[]>,
  perPage: number,
): Promise<readonly T[]> => {
  const mut_items: T[] = [];

  for (let mut_page = 1; ; mut_page += 1) {
    const items = await fetchPage(mut_page);

    mut_items.push(...items);

    if (items.length < perPage) {
      return mut_items;
    }
  }
};
