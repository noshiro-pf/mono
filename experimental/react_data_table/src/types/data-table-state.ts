import * as I from 'immutable'
import { HeaderValueType } from './header-value-type'
import { ISelectorOptionWithViewValue } from './selector-option-with-view-value'
import { SortState, TSortState } from './sort-state'

type IDataTableState = {
  sortState: TSortState
  itemsPerPage: number
  pageNumber: number
  headerValuesAll: I.List<HeaderValueType>
  selectorOptionsAll: I.List<I.List<ISelectorOptionWithViewValue>>
  filteredIndice: I.List<number>
  sortedIndice: I.List<number>
  slicedIndice: I.List<number>
  tableTransformedSliced: I.List<[number, I.List<string>]>
}

export type TDataTableState = I.Record<IDataTableState> &
  Readonly<IDataTableState>

const DataTableStateRecordFactory = I.Record<IDataTableState>({
  sortState: SortState(),
  itemsPerPage: 50,
  pageNumber: 1,
  headerValuesAll: I.List<HeaderValueType>(),
  selectorOptionsAll: I.List<I.List<ISelectorOptionWithViewValue>>(),
  filteredIndice: I.List<number>(),
  sortedIndice: I.List<number>(),
  slicedIndice: I.List<number>(),
  tableTransformedSliced: I.List<[number, I.List<string>]>(),
})

export const DataTableState = (
  dt?: Partial<IDataTableState>,
): TDataTableState => DataTableStateRecordFactory(dt)
