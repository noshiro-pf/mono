import * as I from 'immutable'
import * as num from 'typescript-utils/functions/number'
import * as str from 'typescript-utils/functions/string'
import { TColumnSetting } from '../types/column-setting'
import { ISelectorOptionWithViewValue } from '../types/selector-option-with-view-value'

export const makeAllSelectOptions = (
  table: I.List<I.List<any>>,
  columnSettings: I.List<TColumnSetting>
): I.List<I.List<ISelectorOptionWithViewValue>> =>
  !table || table.isEmpty()
    ? columnSettings.map(() => I.List())
    : columnSettings.map((cs, ci) =>
        makeSelectOptions(
          table.map((line) => line.get(ci)),
          cs
        )
      )

const makeSelectOptions = (
  column: I.List<any>,
  cs: TColumnSetting
): I.List<any> => {
  if (
    cs.filterType !== 'select' &&
    cs.filterType !== 'multiSelect-or' &&
    cs.filterType !== 'multiSelect-and'
  ) {
    return I.List()
  }

  const cellTypeIsArray = ['number[]', 'string[]'].includes(cs.cellType)

  const options = (
    cellTypeIsArray
      ? I.Set((column as I.List<I.List<number | string>>).flatMap((a) => a))
      : I.Set(column)
  ).toList()

  switch (cs.sort) {
    case false:
      return options
    case 'number':
    case 'number-lex':
      return options.sort(num.cmp)
    case 'number-reverse':
    case 'number-lex-reverse':
      return options.sort(num.cmpR)
    case 'string':
    case 'string-lex':
      return options.sort(str.cmp)
    case 'string-reverse':
    case 'string-lex-reverse':
      return options.sort(str.cmpR)
    default:
      return cellTypeIsArray
        ? options
            .map((e) => I.List([e]))
            .sort(cs.sort)
            .map((e) => e.first())
        : options.sort(cs.sort)
  }
}
