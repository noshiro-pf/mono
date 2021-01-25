import * as I from 'immutable'
import React, { memo } from 'react'
import {
  DataTable,
  ICellPosition,
  TDataTableState,
  TTableSettings,
} from 'react-data-table'
import styled from 'styled-components'

const Root = styled.div`
  margin: 20px;
`

export const CardListView = memo(
  ({
    table,
    settings,
    cellClick,
    tableStateChange,
  }: Readonly<{
    table: I.List<I.List<any>>
    settings: TTableSettings
    cellClick: (pos: ICellPosition) => void
    tableStateChange: (s: TDataTableState) => any
  }>) => (
    <Root>
      {!!table &&
        (table.isEmpty() ||
          table.get(0, I.List()).size === settings.columnSettings.size) && (
          <DataTable
            table={table}
            settings={settings}
            cellClick={cellClick}
            tableStateChange={tableStateChange}
          />
        )}
    </Root>
  )
)

CardListView.displayName = 'CardListView'
