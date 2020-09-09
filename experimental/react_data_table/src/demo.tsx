import React, { memo, useCallback, useMemo } from 'react'
import ReactDOM from 'react-dom'

import * as I from 'immutable'

import * as num from 'typescript-utils/functions/number'
import * as str from 'typescript-utils/functions/string'
import * as random from 'typescript-utils/functions/random'

import { TableSettings } from './types/table-settings'
import { DataTable } from './data-table'
import { TDataTableState } from './types/data-table-state'
import { ColumnSetting } from './types/column-setting'

const alph = I.List(str.getAlphabets('lower'))

const tableGenerator = () =>
  I.List(num.seq0(100)).map(() => {
    const randomAlphabets = alph.filter(() => Math.random() >= 0.5)
    return I.List([
      random.getShuffled(randomAlphabets.toArray()).join(''),
      randomAlphabets,
      randomAlphabets,
      randomAlphabets.size
    ])
  })

const settings = TableSettings({
  usepagination: true,
  displayNo: true,
  itemsPerPageInit: 20,
  itemsPerPageOptions: I.List([10, 20, 30, 50, 100]),
  bufferTime: {
    headerValues: 200,
    sort: 200,
    itemsPerPage: 50,
    pageNumber: 50
  },
  columnSettings: I.List([
    ColumnSetting({
      label: 'alphabets',
      cellType: 'string',
      filterType: 'input',
      align: 'center',
      sort: 'string',
      isButton: false
    }),
    ColumnSetting({
      label: 'alphabets set (and)',
      cellType: 'string[]',
      filterType: 'multiSelect-and',
      align: 'center',
      sort: 'string-lex',
      isButton: true,
      cellToStr: (cell: I.List<string>) => cell.join(',')
    }),
    ColumnSetting({
      label: 'alphabets set (or)',
      cellType: 'string[]',
      filterType: 'multiSelect-or',
      align: 'center',
      sort: false,
      isButton: false,
      cellToStr: (cell: I.List<string>) => cell.join(',')
    }),
    ColumnSetting({
      label: 'length',
      cellType: 'number',
      filterType: 'select',
      align: 'center',
      sort: num.cmp,
      isButton: false
    })
  ])
})

export const DataTableDemo = memo(() => {
  const table = useMemo(() => tableGenerator(), [])

  const cellClick = useCallback((v: any) => {
    console.log(v)
  }, [])

  const tableStateChange = useCallback((s: TDataTableState) => {
    console.log('tableStateChange', s)
  }, [])

  return (
    <div style={{ margin: '20px' }}>
      <h1>Data Table Demo</h1>
      <DataTable
        table={table}
        settings={settings}
        cellClick={cellClick}
        tableStateChange={tableStateChange}
      />
    </div>
  )
})

DataTableDemo.displayName = 'DataTableDemo'

ReactDOM.render(<DataTableDemo />, document.getElementById('root'))
