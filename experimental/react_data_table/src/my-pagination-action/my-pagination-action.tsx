import React, { memo, useCallback } from 'react'
import { MyPaginationActionsView } from './my-pagination-action-view'

export const MyPaginationActions = memo(
  ({
    page,
    count,
    rowsPerPage,
    onChangePage,
  }: Readonly<{
    page: number
    count: number
    rowsPerPage: number
    onChangePage: (event: any, page: number) => void
  }>) => {
    const handleFirstPageButtonClick = useCallback(
      (event: any) => {
        onChangePage(event, 0)
      },
      [onChangePage],
    )

    const handleBackButtonClick = useCallback(
      (event: any) => {
        onChangePage(event, page - 1)
      },
      [page, onChangePage],
    )

    const handleNextButtonClick = useCallback(
      (event: any) => {
        onChangePage(event, page + 1)
      },
      [page, onChangePage],
    )

    const handleLastPageButtonClick = useCallback(
      (event: any) => {
        onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
      },
      [count, rowsPerPage, onChangePage],
    )

    return (
      <MyPaginationActionsView
        page={page}
        count={count}
        rowsPerPage={rowsPerPage}
        handleFirstPageButtonClick={handleFirstPageButtonClick}
        handleBackButtonClick={handleBackButtonClick}
        handleNextButtonClick={handleNextButtonClick}
        handleLastPageButtonClick={handleLastPageButtonClick}
      />
    )
  },
)

MyPaginationActions.displayName = 'MyPaginationActions'
