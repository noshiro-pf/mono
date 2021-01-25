import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core'
import * as I from 'immutable'
import React, { memo, useCallback } from 'react'
import { ISelectorOptionWithViewValue } from '../../../../types/selector-option-with-view-value'

export const FilterByMultiselectDialogView = memo(
  ({
    open,
    okClick,
    cancel,
    title,
    selectorOptions,
    selectedIndice,
    flip,
    selectAllClick,
  }: Readonly<{
    open: boolean
    okClick: () => void
    cancel: () => void
    title: string
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    selectedIndice: I.List<number>
    flip: (idx: number) => void
    selectAllClick: (deselect: boolean) => void
  }>) => {
    const numOptions = selectorOptions.size
    const numSelected = selectedIndice.size

    const flipOnClick = useCallback((i: number) => () => flip(i), [flip])

    const onSelectAllClick = useCallback(() => {
      selectAllClick(numSelected === numOptions)
    }, [selectAllClick, numSelected, numOptions])

    return (
      <Dialog open={open} onClose={cancel}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <Tooltip title='select/deselect all' placement='right'>
                  <TableCell padding='checkbox'>
                    <Checkbox
                      indeterminate={
                        0 < numSelected && numSelected < numOptions
                      }
                      checked={numSelected === numOptions}
                      onChange={onSelectAllClick}
                    />
                  </TableCell>
                </Tooltip>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {selectorOptions.map((option, i) => (
                <TableRow key={i}>
                  <TableCell padding='checkbox'>
                    <Checkbox
                      color='primary'
                      checked={selectedIndice.includes(i)}
                      onChange={flipOnClick(i)}
                    />
                  </TableCell>
                  <TableCell>{option.viewValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button color='primary' onClick={okClick}>
            OK
          </Button>
          <Button color='default' onClick={cancel}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
)

FilterByMultiselectDialogView.displayName = 'FilterByMultiselectDialogView'
