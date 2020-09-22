import * as I from 'immutable'

import { FilterType } from './filter-type'
import { CellAlignType } from './cell-align-type'
import { CellValueType } from './cell-value-type'
import { SortColumnType } from './sort-column-type'

type IColumnSetting = {
  label: string
  isButton: boolean
  align: CellAlignType
  cellType: CellValueType
  filterType: FilterType
  sort: SortColumnType // sort settings
  cellToStr: (cell: any) => string // transformation for view
  selectorWithCount: boolean
}

export type TColumnSetting = I.Record<IColumnSetting> & Readonly<IColumnSetting>

const ColumnSettingRecordFactory = I.Record<IColumnSetting>({
  label: '',
  isButton: false,
  align: 'center',
  cellType: 'string',
  filterType: 'none',
  sort: false,
  cellToStr: (v: any) => v.toString(),
  selectorWithCount: false
})

export const ColumnSetting = (cs?: Partial<IColumnSetting>): TColumnSetting =>
  ColumnSettingRecordFactory(cs)
