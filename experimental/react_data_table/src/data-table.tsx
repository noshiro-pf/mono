import React, { memo } from 'react'
import * as I from 'immutable'

import { TTableSettings } from './types/table-settings'
import { DataTableSub } from './data-table-sub'
import { TDataTableState } from './types/data-table-state'
import { ICellPosition } from './types/cell-position'

const noop = () => 0

export const DataTable = memo(
  ({
    table,
    settings,
    cellClick,
    tableStateChange
  }: Readonly<{
    table: I.List<I.List<any>>
    settings: TTableSettings
    cellClick?: (pos: ICellPosition) => void
    tableStateChange?: (s: TDataTableState) => any
  }>) => (
    <div>
      {!!table &&
        !!settings &&
        (table.isEmpty() ||
          table.get(0, I.List()).size === settings.columnSettings.size) && (
          <DataTableSub
            settings={settings}
            table={table}
            tableStateChange={tableStateChange || noop}
            cellClick={cellClick || noop}
          />
        )}
    </div>
  )
)

DataTable.displayName = 'DataTable'
