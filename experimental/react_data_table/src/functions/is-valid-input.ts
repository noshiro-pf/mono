import * as I from 'immutable'

import { isValidSettings } from './is-valid-setting'
import { isValidTable } from './is-valid-table'
import { TTableSettings } from '../types/table-settings'

export const isValidInput = (
  settings: TTableSettings,
  table: I.List<I.List<any>>,
  log = true
): boolean => {
  if (!isValidSettings(settings)) {
    if (log) console.error('"settings" is not valid')
    return false
  }

  if (!isValidTable(table, log)) {
    if (log) console.error('"table" is not valid')
    return false
  }

  /* tableとの齟齬チェック */
  if (!table.isEmpty()) {
    if (settings.columnSettings.size !== table.get(0, I.List()).size)
      return false
  }

  return true
}
