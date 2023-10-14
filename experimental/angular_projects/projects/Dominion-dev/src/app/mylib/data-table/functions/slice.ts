export const slice = <T>(
  table: T[],
  itemsPerPage: number,
  pageNumber: number,
): T[] => {
  return table.slice(
    itemsPerPage * (pageNumber - 1),
    itemsPerPage * pageNumber,
  );
};
