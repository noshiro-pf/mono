import React, { memo, useCallback } from 'react'
import * as I from 'immutable'

import { MyTableHeaderView } from './my-table-header-view'
import { ISelectorOptionWithViewValue } from '../types/selector-option-with-view-value'
import { TColumnSetting } from '../types/column-setting'
import { CellSortStateType, TSortState, SortState } from '../types/sort-state'
import { HeaderValueType } from '../types/header-value-type'

export const MyTableHeader = memo(
  ({
    displayNo,
    columnSettings,
    selectorOptionsAll,
    headerValues,
    sortState,
    headerValueChange,
    sortStateChange
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
            activeCellState: cellSortState
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
