import React, { memo } from 'react'
import * as I from 'immutable'

import { RN } from 'rnjs'
import {
  useRNValue,
  useRNEffect,
  useEffectFromProps,
  useStateAsStream,
  useEventAsStream,
  useRN
} from 'rnjs-hooks'

import { TTableSettings, TableSettings } from './types/table-settings'
import { TSortState, SortState } from './types/sort-state'
import { ICellPosition, ICellPositionInPage } from './types/cell-position'
import { HeaderValueType } from './types/header-value-type'
import { TDataTableState } from './types/data-table-state'
import { DataTableDataFlow } from './functions/data-table-flow'
import { isValidInput } from './functions/is-valid-input'
import { DataTableView } from './data-table-view'

export const DataTableSub = memo(
  ({
    table,
    settings,
    tableStateChange,
    cellClick
  }: Readonly<{
    table: I.List<I.List<any>>
    settings: TTableSettings
    tableStateChange: (s: TDataTableState) => any
    cellClick: (pos: ICellPosition) => void
  }>) => {
    if (!isValidInput(settings, table)) {
      console.error('"settings" or "table" is not valid.')
    }

    // from props

    const [fromProps$, setFromProps] = useStateAsStream<
      [I.List<I.List<any>>, TTableSettings]
    >([I.List(), TableSettings()])

    useEffectFromProps([table, settings], setFromProps, [table, settings])

    // from events

    const [itemsPerPage$, setItemsPerPage] = useStateAsStream(50)

    const [pageNumber$, setPageNumber] = useStateAsStream(1)

    const [sortState$, setSortState] = useStateAsStream<TSortState>(SortState())

    // prettier-ignore
    const [headerValue$, setHeaderValue]
      = useStateAsStream<{ columnIndex: number, value: HeaderValueType }>({ columnIndex: 0, value: '' })

    const [resetAllClick$, resetAllClick] = useEventAsStream()

    /* streams */

    const dtState$: RN<TDataTableState> = useRN(
      DataTableDataFlow(
        fromProps$,
        itemsPerPage$,
        pageNumber$,
        headerValue$,
        sortState$,
        resetAllClick$
      )
    )

    // callbacks

    useRNEffect(dtState$, tableStateChange)

    const cellOnClick = (pos: ICellPositionInPage) => {
      const itemsPerPage = dtState$.value.itemsPerPage
      const pageNumber = dtState$.value.pageNumber
      const rowIndexInPage = pos.rowIndexInThisPage
      const columnIndex = pos.columnIndex
      const slicedIndice = dtState$.value.slicedIndice
      cellClick({
        rowIndex: slicedIndice.get(rowIndexInPage, 0),
        rowIndexInFilteredIndice:
          itemsPerPage * (pageNumber - 1) + rowIndexInPage,
        rowIndexInSlicedIndice: rowIndexInPage,
        columnIndex: columnIndex
      })
    }

    // extract values

    const dtState = useRNValue(dtState$, true)

    return (
      <div>
        {dtState !== null && (
          <DataTableView
            settings={settings}
            dtState={dtState}
            itemsPerPageChange={setItemsPerPage}
            pageNumberChange={setPageNumber}
            sortStateChange={setSortState}
            headerValueChange={setHeaderValue}
            cellClick={cellOnClick}
            resetAll={resetAllClick}
          />
        )}
      </div>
    )
  }
)

DataTableSub.displayName = 'DataTableSub'
