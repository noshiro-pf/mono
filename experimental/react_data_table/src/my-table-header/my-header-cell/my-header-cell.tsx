import * as I from 'immutable'
import React, { memo, useCallback } from 'react'
import { TColumnSetting } from '../../types/column-setting'
import { HeaderValueType } from '../../types/header-value-type'
import { ISelectorOptionWithViewValue } from '../../types/selector-option-with-view-value'
import { CellSortStateType } from '../../types/sort-state'
import { HeaderCellView } from './my-header-cell-view'

export const MyHeaderCell = memo(
  ({
    columnId,
    columnSetting,
    selectorOptions,
    cellSortState,
    headerValue,
    cellSortStateChange,
    headerValueChange,
  }: Readonly<{
    columnId: number | 'NoColumn'
    columnSetting: TColumnSetting
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    cellSortState: CellSortStateType
    headerValue: HeaderValueType
    cellSortStateChange: (
      columnId: number | 'NoColumn',
      state: CellSortStateType
    ) => void
    headerValueChange: (v: {
      columnIndex: number
      value: HeaderValueType
    }) => void
  }>) => {
    const inputChange = useCallback(
      (value: string = '') => {
        headerValueChange({ columnIndex: columnId as number, value })
      },
      [columnId, headerValueChange]
    )

    const selectedIndexChange = useCallback(
      (selectedIndex: number) => {
        headerValueChange({
          columnIndex: columnId as number,
          value: selectedIndex,
        })
      },
      [columnId, headerValueChange]
    )

    const selectedIndiceChange = useCallback(
      (selectedIndice: I.List<number>) => {
        headerValueChange({
          columnIndex: columnId as number,
          value: selectedIndice,
        })
      },
      [columnId, headerValueChange]
    )

    const sortClick = useCallback(() => {
      const nextState = (() => {
        switch (cellSortState) {
          case 'asc':
            return 'desc'
          case 'desc':
            return ''
          case '':
            return 'asc'
          default:
            return ''
        }
      })()
      cellSortStateChange(columnId, nextState)
    }, [cellSortState, columnId, cellSortStateChange])

    return (
      <HeaderCellView
        filterType={columnSetting.filterType}
        selectorOptions={selectorOptions}
        label={columnSetting.label}
        align={columnSetting.align}
        sortable={columnSetting.sort !== false}
        cellSortState={cellSortState}
        headerValue={headerValue}
        inputChange={inputChange}
        selectedIndexChange={selectedIndexChange}
        selectedIndiceChange={selectedIndiceChange}
        sortClick={sortClick}
      />
    )
  }
)

MyHeaderCell.displayName = 'MyHeaderCell'
