import * as I from 'immutable'

import { TTableSettings } from '../types/table-settings'
import { TColumnSetting } from '../types/column-setting'

export const isValidSettings = (settings: TTableSettings): boolean => {
  /* settingsに不正な値がある場合 */
  if (!settings) return false
  if (
    !settings.columnSettings ||
    !settings.itemsPerPageInit ||
    !settings.itemsPerPageOptions
  )
    return false
  if (typeof settings.displayNo !== 'boolean') return false
  if (typeof settings.usepagination !== 'boolean') return false
  if (typeof settings.itemsPerPageInit !== 'number') return false
  if (!I.List.isList(settings.itemsPerPageOptions)) return false
  if (!I.List.isList(settings.columnSettings)) return false
  if (!settings.itemsPerPageOptions.includes(settings.itemsPerPageInit))
    return false
  if (settings.columnSettings.some(e => !isValidColumnSetting(e))) return false

  return true
}

const isValidColumnSetting = (s: TColumnSetting): boolean => {
  if (s.filterType === 'multiSelect-and') {
    if (!['number[]', 'string[]'].includes(s.cellType)) return false
  }
  return true
}
