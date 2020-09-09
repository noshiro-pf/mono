import React, { memo } from 'react'
import * as I from 'immutable'
import { TableHead, TableRow } from '@material-ui/core'

import { MyHeaderCell } from './my-header-cell/my-header-cell'
import { ISelectorOptionWithViewValue } from '../types/selector-option-with-view-value'
import { ColumnSetting, TColumnSetting } from '../types/column-setting'
import { TSortState, CellSortStateType } from '../types/sort-state'
import { HeaderValueType } from '../types/header-value-type'

const NumberColumnColumnSettings = ColumnSetting({
  label: '',
  align: 'center',
  sort: 'number'
})

export const MyTableHeaderView = memo(
  ({
    displayNo,
    columnSettings,
    selectorOptionsAll,
    headerValues,
    sortState,
    cellSortStateChange,
    headerValueChange
  }: Readonly<{
    displayNo: boolean
    columnSettings: I.List<TColumnSetting>
    selectorOptionsAll: I.List<I.List<ISelectorOptionWithViewValue>>
    headerValues: I.List<HeaderValueType>
    sortState: TSortState
    cellSortStateChange: (
      columnId: number | 'NoColumn',
      state: CellSortStateType
    ) => void
    headerValueChange: (v: {
      columnIndex: number
      value: HeaderValueType
    }) => void
  }>) => (
    <TableHead>
      <TableRow>
        {displayNo && (
          <MyHeaderCell
            columnId={'NoColumn'}
            columnSetting={NumberColumnColumnSettings}
            selectorOptions={I.List()}
            cellSortState={
              sortState.activeColumnId === 'NoColumn'
                ? sortState.activeCellState
                : ''
            }
            headerValue={''}
            cellSortStateChange={cellSortStateChange}
            headerValueChange={headerValueChange}
          />
        )}
        {columnSettings.map((header, colIdx) => (
          <MyHeaderCell
            key={colIdx}
            columnId={colIdx}
            columnSetting={header}
            selectorOptions={selectorOptionsAll.get(colIdx, I.List())}
            cellSortState={
              sortState.activeColumnId === colIdx
                ? sortState.activeCellState
                : ''
            }
            headerValue={headerValues.get(colIdx, '')}
            cellSortStateChange={cellSortStateChange}
            headerValueChange={headerValueChange}
          />
        ))}
      </TableRow>
    </TableHead>
  )
)

MyTableHeaderView.displayName = 'MyTableHeaderView'
