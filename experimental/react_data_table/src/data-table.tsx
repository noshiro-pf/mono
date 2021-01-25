import * as I from 'immutable'
import React, { memo } from 'react'
import { DataTableSub } from './data-table-sub'
import { ICellPosition } from './types/cell-position'
import { TDataTableState } from './types/data-table-state'
import { TTableSettings } from './types/table-settings'

const noop = () => 0

export const DataTable = memo(
  ({
    table,
    settings,
    cellClick,
    tableStateChange,
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
