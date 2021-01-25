import * as I from 'immutable'
import * as str from 'typescript-utils/functions/string'
import { ColumnSetting, TColumnSetting } from '../types/column-setting'
import { HeaderValueType } from '../types/header-value-type'
import { TTableSettings } from '../types/table-settings'

// cache filter results and check only the difference of headerValues

export const getFilteredIndice = (
  table: I.List<I.List<any>>,
  settings: TTableSettings,
  selectorOptionsAll: I.List<I.List<any>>,
  headerValuesAll: I.List<HeaderValueType>,
  cache: {
    headerValuesAllPrev: I.List<HeaderValueType>
    filterResults: boolean[][]
  }
): I.List<number> => {
  const indice = table.map((_, i) => i)

  if (!headerValuesAll || headerValuesAll.isEmpty()) {
    return indice
  }

  // initialize headerValuesAllPrev
  if (cache.headerValuesAllPrev.size !== headerValuesAll.size) {
    cache.headerValuesAllPrev = headerValuesAll.slice() // copy
  }

  // initialize filterFnResult
  if (
    cache.filterResults.length !== table.size ||
    (cache.filterResults[0] || []).length !== table.get(0, I.List()).size
  ) {
    cache.filterResults = table
      .map((row) => row.map((_) => true).toArray())
      .toArray()
  }

  updateFilterResultsCache(
    table,
    settings,
    selectorOptionsAll,
    headerValuesAll,
    cache.headerValuesAllPrev,
    cache.filterResults
  )

  // update headerValuesAllPrev
  cache.headerValuesAllPrev = headerValuesAll.slice() // copy

  return indice.filter((rowIdx) =>
    (cache.filterResults[rowIdx] || []).every((e) => e)
  )
}

const updateFilterResultsCache = (
  table: I.List<I.List<any>>,
  settings: TTableSettings,
  selectorOptionsAll: I.List<I.List<any>>,
  headerValuesAll: I.List<HeaderValueType>,
  headerValuesAllPrev: I.List<HeaderValueType>,
  filterResultsCache: boolean[][]
) => {
  headerValuesAllPrev.zipAll(headerValuesAll).forEach(([prev, curr], ci) => {
    if (prev !== curr) {
      updateFilterResultsOfColumn(
        ci, // column index
        settings.columnSettings.get(ci, ColumnSetting()),
        table,
        selectorOptionsAll.get(ci, I.List()),
        curr,
        filterResultsCache
      )
    }
  })
}

const updateFilterResultsOfColumn = (
  colIdx: number,
  columnSetting: TColumnSetting,
  table: I.List<I.List<any>>,
  selectorOptions: I.List<any>,
  headerValue: HeaderValueType,
  filterResultsCache: boolean[][]
): void => {
  table.forEach((tableRow, rowIdx) => {
    filterResultsCache[rowIdx][colIdx] = filterResultOfCell(
      tableRow.get(colIdx, ''),
      columnSetting,
      selectorOptions,
      headerValue
    )
  })
}

const filterResultOfCell = (
  tableCell: any,
  columnSetting: TColumnSetting,
  selectorOptions: I.List<any>,
  headerValue: HeaderValueType
): boolean => {
  const typeofTableCell = typeof tableCell
  const filterType = columnSetting.filterType
  const transformed = columnSetting.cellToStr(tableCell)

  switch (typeof headerValue) {
    case 'string':
      // columnSetting.filterType is 'input'
      if (headerValue === '') return true // not filtered
      if (typeofTableCell !== 'string') {
        throw new Error(
          `ERROR: tableCell must be an array but the value is ${tableCell}(${typeofTableCell}).`
        )
      }
      if (!str.submatch(transformed, headerValue, true)) return false
      break
    case 'number':
      // columnSetting.filterType is 'select'
      if (headerValue === -1) return true // not filtered
      if (!['string', 'boolean', 'number'].includes(typeofTableCell)) {
        throw new Error(
          `ERROR: tableCell must be primitive but the value is ${tableCell}(${typeofTableCell}).`
        )
      }
      if (tableCell !== selectorOptions.get(headerValue)) return false
      break
    default:
      // case 'number[]'
      // columnSetting.filterType is 'multiSelect-and/or'

      const headerValueMapped = headerValue.map((e) => selectorOptions.get(e))

      if (filterType === 'multiSelect-and') {
        /* for any e in headerValue, e in cell */
        if (headerValue.isEmpty()) return true // not filtered
        if (!I.List.isList(tableCell)) {
          throw new Error(
            `ERROR: tableCell must be an array but the value is ${tableCell}(${typeofTableCell}).`
          )
        }
        if (!headerValueMapped.isSubset(tableCell)) return false
      } else if (filterType === 'multiSelect-or') {
        if (!I.List.isList(tableCell)) {
          if (!headerValueMapped.includes(tableCell)) return false
        } else {
          /* for some e in headerValue, e in cell */
          if (I.Set.intersect([headerValueMapped, tableCell]).isEmpty())
            return false
        }
      }

      break
  }

  return true
}
