import * as I from 'immutable'

import { TTableSettings } from '../types/table-settings'
import { ColumnSetting } from '../types/column-setting'

export const transformTable = (
  table: I.List<I.List<any>>,
  settings: TTableSettings
): I.List<I.List<string>> =>
  table.map(row =>
    row.map((cellVal, colidx) =>
      settings.columnSettings.get(colidx, ColumnSetting()).get('cellToStr')(
        cellVal
      )
    )
  )
