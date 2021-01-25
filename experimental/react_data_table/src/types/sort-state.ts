import * as I from 'immutable'

export type CellSortStateType = 'asc' | 'desc' | ''

type ISortState = {
  activeColumnId: number | 'NoColumn' | ''
  activeCellState: CellSortStateType
}

export type TSortState = I.Record<ISortState> & Readonly<ISortState>

const SortStateRecordFactory = I.Record<ISortState>({
  activeColumnId: '',
  activeCellState: '',
})

export const SortState = (ss?: Partial<ISortState>): TSortState =>
  SortStateRecordFactory(ss)
