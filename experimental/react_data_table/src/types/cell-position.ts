import * as I from 'immutable'

export type ICellPosition = {
  rowIndex: number
  rowIndexInFilteredIndice: number
  rowIndexInSlicedIndice: number
  columnIndex: number
}

export const CellPosition = I.Record<ICellPosition>({
  rowIndex: 0,
  rowIndexInFilteredIndice: 0,
  rowIndexInSlicedIndice: 0,
  columnIndex: 0
})()

export type ICellPositionInPage = {
  rowIndexInThisPage: number
  columnIndex: number
}

export const CellPositionInPage = I.Record<ICellPositionInPage>({
  rowIndexInThisPage: 0,
  columnIndex: 0
})
