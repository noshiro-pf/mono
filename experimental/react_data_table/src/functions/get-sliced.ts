import * as I from 'immutable'

export const getSlicedIndice = (
  indice: I.List<number>,
  itemsPerPage: number,
  pageNumber: number,
): I.List<number> =>
  indice.slice(itemsPerPage * (pageNumber - 1), itemsPerPage * pageNumber)
