import React, { memo } from 'react'
import * as I from 'immutable'
import { TableCell, TableSortLabel } from '@material-ui/core'
import SortIcon from '@material-ui/icons/Sort'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

import { FilterType } from '../../types/filter-type'
import { ISelectorOptionWithViewValue } from '../../types/selector-option-with-view-value'
import { CellAlignType } from '../../types/cell-align-type'
import { CellSortStateType } from '../../types/sort-state'
import { HeaderValueType } from '../../types/header-value-type'
import { SwitchHeadereCellView } from './switch-header-cell-view'
import styled from 'styled-components'

const TableCellContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const SortButton = styled.div`
  margin: 3px;
`

export const HeaderCellView = memo(
  ({
    filterType,
    label,
    align,
    selectorOptions,
    sortable,
    cellSortState,
    headerValue,
    inputChange,
    selectedIndexChange,
    selectedIndiceChange,
    sortClick
  }: Readonly<{
    filterType: FilterType
    label: string
    align: CellAlignType
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    sortable: boolean
    cellSortState: CellSortStateType
    headerValue: HeaderValueType
    inputChange: (v: string) => void
    selectedIndexChange: (v: number) => void
    selectedIndiceChange: (v: I.List<number>) => void
    sortClick: () => void
  }>) => (
    <TableCell align={align} variant='head'>
      <TableCellContent>
        <SwitchHeadereCellView
          filterType={filterType}
          label={label}
          selectorOptions={selectorOptions}
          headerValue={headerValue}
          inputChange={inputChange}
          selectedIndexChange={selectedIndexChange}
          selectedIndiceChange={selectedIndiceChange}
        />
        {sortable && (
          <SortButton>
            <TableSortLabel
              active={true}
              direction={cellSortState === 'asc' ? 'asc' : 'desc'}
              onClick={sortClick}
              IconComponent={
                cellSortState !== '' ? ArrowDownwardIcon : SortIcon
              }
            />
          </SortButton>
        )}
      </TableCellContent>
    </TableCell>
  )
)

HeaderCellView.displayName = 'HeaderCellView'
