import * as I from 'immutable'
import { ColumnSetting } from '../types/column-setting'
import { TTableSettings } from '../types/table-settings'

export const transformTable = (
  table: I.List<I.List<any>>,
  settings: TTableSettings
): I.List<I.List<string>> =>
  table.map((row) =>
    row.map((cellVal, colidx) =>
      settings.columnSettings.get(colidx, ColumnSetting()).get('cellToStr')(
        cellVal
      )
    )
  )
