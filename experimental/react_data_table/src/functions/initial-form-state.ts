import * as I from 'immutable'

import { TTableSettings } from '../types/table-settings'
import { ISelectorOptionWithViewValue } from '../types/selector-option-with-view-value'
import { HeaderValueType } from '../types/header-value-type'
import { SortState, TSortState } from '../types/sort-state'

export const initialHeaderValues = (
  settings: TTableSettings,
  selectorOptionsAll: I.List<I.List<ISelectorOptionWithViewValue>>
): I.List<HeaderValueType> =>
  I.List(
    settings.columnSettings.map((setting, colIdx) => {
      switch (setting.filterType) {
        case 'input':
          return ''
        case 'select':
          return -1
        case 'multiSelect-and':
          return I.List() as I.List<number>
        case 'multiSelect-or':
          return (selectorOptionsAll.get(colIdx) || I.List()).map((_, i) => i)
        case 'none':
        default:
          return ''
      }
    })
  )

export const initialFormState = (
  settings: TTableSettings,
  selectorOptionsAll: I.List<I.List<ISelectorOptionWithViewValue>>
): {
  headerValues: I.List<HeaderValueType>
  sortState: TSortState
} => ({
  sortState: SortState(),
  headerValues: initialHeaderValues(settings, selectorOptionsAll)
})
