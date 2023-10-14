import { Button, Paper, Table, TablePagination } from '@material-ui/core'
import React, { ChangeEvent, memo, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { MyPaginationActions } from './my-pagination-action/my-pagination-action'
import { MyTableBody } from './my-table-body/my-table-body'
import { MyTableHeader } from './my-table-header/my-table-header'
import { ICellPositionInPage } from './types/cell-position'
import { TDataTableState } from './types/data-table-state'
import { HeaderValueType } from './types/header-value-type'
import { TSortState } from './types/sort-state'
import { TTableSettings } from './types/table-settings'

const TableWrapper = styled.div`
  overflow-x: auto;
`

const TableFooter = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  overflow-x: auto;
`

const Spacer = styled.div`
  flex-grow: 1;
`

const ResetButtonWrapper = styled.div`
  padding: 7px;
`

export const DataTableView = memo(
  ({
    settings,
    dtState,
    headerValueChange,
    sortStateChange,
    cellClick,
    itemsPerPageChange,
    pageNumberChange,
    resetAll,
  }: Readonly<{
    settings: TTableSettings
    dtState: TDataTableState
    headerValueChange: (v: {
      columnIndex: number
      value: HeaderValueType
    }) => void
    sortStateChange: (sortState: TSortState) => void
    cellClick: (pos: ICellPositionInPage) => void
    itemsPerPageChange: (v: number) => void
    pageNumberChange: (v: number) => void
    resetAll: () => void
  }>) => {
    const {
      selectorOptionsAll,
      headerValuesAll,
      sortState,
      filteredIndice,
      itemsPerPage,
      pageNumber,
      tableTransformedSliced,
    } = dtState

    const pageNumberOnChange = useCallback(
      (_ev: any, page: number) => {
        pageNumberChange(page + 1)
      },
      [pageNumberChange],
    )

    const itemsPerPageOnChange = useCallback(
      (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        itemsPerPageChange(parseInt(ev.target.value, 10))
      },
      [itemsPerPageChange],
    )

    const isValid: boolean = useMemo(() => {
      if (!tableTransformedSliced) return false
      if (!selectorOptionsAll) return false
      const colSize = selectorOptionsAll.size
      if (colSize === 0) return false
      if (colSize !== headerValuesAll.size) return false
      return true
    }, [tableTransformedSliced, selectorOptionsAll, headerValuesAll])

    const useResetAllButton: boolean = useMemo(
      () =>
        settings.usepagination ||
        settings.columnSettings.some((e) => e.filterType !== 'none'),
      [settings],
    )

    return (
      <div>
        {isValid && (
          <Paper>
            <TableWrapper>
              <Table>
                <MyTableHeader
                  displayNo={settings.displayNo}
                  columnSettings={settings.columnSettings}
                  selectorOptionsAll={selectorOptionsAll}
                  headerValues={headerValuesAll}
                  sortState={sortState}
                  headerValueChange={headerValueChange}
                  sortStateChange={sortStateChange}
                />
                <MyTableBody
                  displayNo={settings.displayNo}
                  columnSettings={settings.columnSettings}
                  tableTransformedSliced={tableTransformedSliced}
                  cellClick={cellClick}
                />
              </Table>
            </TableWrapper>

            <TableFooter>
              <Spacer />
              {settings.usepagination && (
                <TablePagination
                  component='div'
                  ActionsComponent={MyPaginationActions}
                  SelectProps={{ native: true }}
                  count={filteredIndice.size}
                  rowsPerPageOptions={settings.itemsPerPageOptions.toArray()}
                  rowsPerPage={itemsPerPage}
                  page={pageNumber - 1}
                  onChangePage={pageNumberOnChange}
                  onChangeRowsPerPage={itemsPerPageOnChange}
                />
              )}
              {useResetAllButton && (
                <ResetButtonWrapper>
                  <Button variant='outlined' onClick={resetAll}>
                    Reset All
                  </Button>
                </ResetButtonWrapper>
              )}
            </TableFooter>
          </Paper>
        )}
      </div>
    )
  },
)

DataTableView.displayName = 'DataTableView'
