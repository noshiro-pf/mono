import * as I from 'immutable'

import * as list from 'typescript-utils/functions/list'
import * as str from 'typescript-utils/functions/string'
import * as num from 'typescript-utils/functions/number'

import { TTableSettings } from '../types/table-settings'
import { TSortState } from '../types/sort-state'
import { ColumnSetting } from '../types/column-setting'

export const getSortedIndice = (
  table: I.List<I.List<any>>,
  filteredIndice: I.List<number>,
  sortState: TSortState,
  settings: TTableSettings
): I.List<number> =>
  sortState.activeCellState === 'desc'
    ? getSortedIndiceSub(table, filteredIndice, sortState, settings).reverse()
    : getSortedIndiceSub(table, filteredIndice, sortState, settings)

const getSortedIndiceSub = (
  table: I.List<I.List<any>>,
  filteredIndice: I.List<number>,
  sortState: TSortState,
  settings: TTableSettings
): I.List<number> => {
  switch (sortState.activeColumnId) {
    case '':
    case 'NoColumn':
      return filteredIndice

    default:
      // number
      const colIndex: number = sortState.activeColumnId
      const cs = settings.columnSettings.get(colIndex, ColumnSetting())

      switch (cs.sort) {
        case false:
          return filteredIndice

        case 'number':
          return sort(table, colIndex, filteredIndice, num.cmp)

        case 'number-reverse':
          return sort(table, colIndex, filteredIndice, num.cmpR)

        case 'number-lex':
          return lexicalSort(table, colIndex, filteredIndice, num.cmp)

        case 'number-lex-reverse':
          return lexicalSort(table, colIndex, filteredIndice, num.cmpR)

        case 'string':
          return sort(table, colIndex, filteredIndice, str.cmp)

        case 'string-reverse':
          return sort(table, colIndex, filteredIndice, str.cmpR)

        case 'string-lex':
          return lexicalSort(table, colIndex, filteredIndice, str.cmp)

        case 'string-lex-reverse':
          return lexicalSort(table, colIndex, filteredIndice, str.cmpR)

        default:
          return sort(table, colIndex, filteredIndice, cs.sort)
      }
  }
}

const sort = <T>(
  table: I.List<I.List<any>>,
  colIndex: number,
  filteredIndice: I.List<number>,
  cmp: (a: T, b: T) => number
): I.List<number> =>
  filteredIndice.sort((x, y) =>
    cmp(table.getIn([x, colIndex]), table.getIn([y, colIndex]))
  )

const lexicalSort = <T>(
  table: I.List<I.List<any>>,
  colIndex: number,
  filteredIndice: I.List<number>,
  cmp: (a: T, b: T) => number
): I.List<number> =>
  filteredIndice.sort((x, y) =>
    list.lexicalCmp(cmp)(table.getIn([x, colIndex]), table.getIn([y, colIndex]))
  )
