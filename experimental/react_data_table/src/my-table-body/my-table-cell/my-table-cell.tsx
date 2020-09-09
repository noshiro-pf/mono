import React, { memo, useCallback } from 'react'
import { TableCell } from '@material-ui/core'

import { ICellPositionInPage } from '../../types/cell-position'
import { CellAlignType } from '../../types/cell-align-type'
import { MyTableCellButton } from './my-table-cell-button'

export const MyTableCell = memo(
  ({
    value,
    isButton,
    align,
    pos,
    cellClick
  }: Readonly<{
    value: string
    isButton: boolean
    align: CellAlignType
    pos: ICellPositionInPage
    cellClick: (pos: ICellPositionInPage) => void
  }>) => {
    const onClick = useCallback(() => {
      cellClick(pos)
    }, [cellClick, pos])

    return (
      <TableCell align={align}>
        {isButton ? (
          <MyTableCellButton value={value as string} onClick={onClick} />
        ) : (
          <span>{value}</span>
        )}
      </TableCell>
    )
  }
)

MyTableCell.displayName = 'MyTableCell'
