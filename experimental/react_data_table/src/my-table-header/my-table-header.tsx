import * as I from 'immutable'
import React, { memo, useCallback } from 'react'
import { TColumnSetting } from '../types/column-setting'
import { HeaderValueType } from '../types/header-value-type'
import { ISelectorOptionWithViewValue } from '../types/selector-option-with-view-value'
import { CellSortStateType, SortState, TSortState } from '../types/sort-state'
import { MyTableHeaderView } from './my-table-header-view'

export const MyTableHeader = memo(
  ({
    displayNo,
    columnSettings,
    selectorOptionsAll,
    headerValues,
    sortState,
    headerValueChange,
    sortStateChange,
  }: Readonly<{
    displayNo: boolean
    columnSettings: I.List<TColumnSetting>
    selectorOptionsAll: I.List<I.List<ISelectorOptionWithViewValue>>
    headerValues: I.List<HeaderValueType>
    sortState: TSortState
    headerValueChange: (v: {
      columnIndex: number
      value: HeaderValueType
    }) => void
    sortStateChange: (sortState: TSortState) => void
  }>) => {
    const cellSortStateChange = useCallback(
      (columnId: number | 'NoColumn', cellSortState: CellSortStateType) => {
        sortStateChange(
          SortState({
            activeColumnId: cellSortState === '' ? '' : columnId,
            activeCellState: cellSortState,
          })
        )
      },
      [sortStateChange]
    )

    return (
      <MyTableHeaderView
        displayNo={displayNo}
        columnSettings={columnSettings}
        selectorOptionsAll={selectorOptionsAll}
        headerValues={headerValues}
        sortState={sortState}
        headerValueChange={headerValueChange}
        cellSortStateChange={cellSortStateChange}
      />
    )
  }
)

MyTableHeader.displayName = 'MyTableHeader'
