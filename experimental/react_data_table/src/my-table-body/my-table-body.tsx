import { TableBody, TableCell, TableRow } from '@material-ui/core'
import * as I from 'immutable'
import React, { memo } from 'react'
import { ICellPositionInPage } from '../types/cell-position'
import { TColumnSetting } from '../types/column-setting'
import { MyTableCell } from './my-table-cell/my-table-cell'

export const MyTableBody = memo(
  ({
    displayNo,
    columnSettings,
    tableTransformedSliced,
    cellClick,
  }: Readonly<{
    displayNo: boolean
    columnSettings: I.List<TColumnSetting>
    tableTransformedSliced: I.List<[number, I.List<string>]>
    cellClick: (pos: ICellPositionInPage) => void
  }>) => (
    <TableBody>
      {tableTransformedSliced.map(([i, row], rowIndexInThisPage) => (
        <TableRow key={i}>
          {displayNo && (
            <TableCell align='center' children={<div>{i + 1}</div>} />
          )}
          {columnSettings.map((cs, colIdx) => (
            <MyTableCell
              key={colIdx}
              value={row.get(colIdx, '')}
              align={cs.align}
              isButton={cs.isButton}
              pos={{
                columnIndex: colIdx,
                rowIndexInThisPage: rowIndexInThisPage,
              }}
              cellClick={cellClick}
            />
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
)

MyTableBody.displayName = 'MyTableBody'
