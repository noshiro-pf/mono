import React, { memo } from 'react'
import { IconButton } from '@material-ui/core'

import FirstPageIcon from '@material-ui/icons/FirstPage'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft'
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight'
import LastPageIcon from '@material-ui/icons/LastPage'
import styled from 'styled-components'

const Root = styled.div`
  flex-shrink: 0;
`

export const MyPaginationActionsView = memo(
  ({
    page,
    count,
    rowsPerPage,
    handleFirstPageButtonClick,
    handleBackButtonClick,
    handleNextButtonClick,
    handleLastPageButtonClick
  }: Readonly<{
    page: number
    count: number
    rowsPerPage: number
    handleFirstPageButtonClick: (event: any) => void
    handleBackButtonClick: (event: any) => void
    handleNextButtonClick: (event: any) => void
    handleLastPageButtonClick: (event: any) => void
  }>) => (
    <Root>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label='First Page'
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label='Previous Page'
      >
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='Next Page'
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='Last Page'
      >
        <LastPageIcon />
      </IconButton>
    </Root>
  )
)

MyPaginationActionsView.displayName = 'MyPaginationActionsView'
