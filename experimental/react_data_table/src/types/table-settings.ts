import * as I from 'immutable'

import { TColumnSetting } from './column-setting'
import { SortState, TSortState } from './sort-state'

type ITableSettings = {
  columnSettings: I.List<TColumnSetting>
  displayNo: boolean
  usepagination: boolean
  itemsPerPageOptions: I.List<number>
  itemsPerPageInit: number
  sortInit: TSortState
  bufferTime: {
    headerValues: number
    sort: number
    itemsPerPage: number
    pageNumber: number
  }
}

export type TTableSettings = I.Record<ITableSettings> & Readonly<ITableSettings>

const TableSettingsRecordFactory = I.Record<ITableSettings>({
  columnSettings: I.List(),
  displayNo: false,
  usepagination: true,
  itemsPerPageOptions: I.List([25, 50, 100]),
  itemsPerPageInit: 25,
  sortInit: SortState(),
  bufferTime: {
    headerValues: 200,
    sort: 150,
    itemsPerPage: 50,
    pageNumber: 50
  }
})

export const TableSettings = (ts?: Partial<ITableSettings>): TTableSettings =>
  TableSettingsRecordFactory(ts)
