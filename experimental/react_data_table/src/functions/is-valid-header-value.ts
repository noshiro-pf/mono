import * as I from 'immutable'
import { FilterType } from '../types/filter-type'
import { HeaderValueType } from '../types/header-value-type'
import { TTableSettings } from '../types/table-settings'

export const isValidHeaderValues = (
  settings: TTableSettings,
  headerValuesAll: I.List<HeaderValueType>,
) => {
  if (settings.columnSettings.size !== headerValuesAll.size) {
    console.error('mismatch in length of headerValues and settings')
    return false
  }

  for (const [i, [headerValue, colSetting]] of headerValuesAll
    .zip(settings.columnSettings)
    .entries()) {
    const filterType = colSetting.filterType
    if (!isValidHeaderValue(headerValue, filterType)) {
      console.error(
        `headerValue and filterType does not match. ${i}-th headerValue is "${headerValue}"(${typeof headerValue}) and filterType is "${filterType}".`,
      )
      return false
    }
  }

  return true
}

const isValidHeaderValue = (
  headerValue: HeaderValueType,
  filterType: FilterType,
): boolean => {
  if (filterType === 'none') return true
  switch (typeof headerValue) {
    case 'string':
      if (filterType !== 'input') return false
      break
    case 'number':
      if (filterType !== 'select') return false
      break
    default:
      // case 'number[]'
      if (filterType !== 'multiSelect-and' && filterType !== 'multiSelect-or')
        return false
      break
  }
  return true
}
