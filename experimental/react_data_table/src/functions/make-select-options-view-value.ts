import * as I from 'immutable'

import { ColumnSetting, TColumnSetting } from '../types/column-setting'
import { ISelectorOptionWithViewValue } from '../types/selector-option-with-view-value'

export const makeAllSelectOptionsWithViewValue = (
  table: I.List<I.List<any>>,
  filteredIndice: I.List<number>,
  selectorOptionsAll: I.List<I.List<any>>,
  columnSettings: I.List<TColumnSetting>
): I.List<I.List<ISelectorOptionWithViewValue>> =>
  selectorOptionsAll.map((selectorOptions, colIdx) =>
    makeSelectOptionsViewValue(
      selectorOptions,
      filteredIndice.map(rowIdx => table.getIn([rowIdx, colIdx])),
      columnSettings.get(colIdx, ColumnSetting())
    )
  )

const makeSelectOptionsViewValue = (
  selectorOptions: I.List<any>,
  columnFiltered: I.List<any>,
  cs: TColumnSetting
) => {
  if (cs.cellType === 'number[]' || cs.cellType === 'string[]') {
    const count = (e: number | string) =>
      columnFiltered.filter((cell: I.List<number | string>) => cell.includes(e))
        .size

    return selectorOptions.map((e: number | string) => ({
      value: e,
      viewValue:
        cs.cellToStr([e]) + (!cs.selectorWithCount ? '' : `(${count(e)})`)
    }))
  } else {
    const count = (e: any) =>
      columnFiltered.filter((cell: any) => cell === e).size

    return selectorOptions.map(e => ({
      value: e,
      viewValue:
        cs.cellToStr(e) + (!cs.selectorWithCount ? '' : `(${count(e)})`)
    }))
  }
}
