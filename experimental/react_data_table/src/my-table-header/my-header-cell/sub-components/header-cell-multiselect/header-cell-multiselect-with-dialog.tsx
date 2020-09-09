import React, { memo, useState, useCallback } from 'react'
import * as I from 'immutable'

import { ISelectorOptionWithViewValue } from '../../../../types/selector-option-with-view-value'
import { HeaderCellMultiSelectByDialogView } from './header-cell-multiselect-with-dialog-view'

export const HeaderCellMultiSelectWithDialog = memo(
  ({
    multiSelectType,
    label,
    selectorOptions,
    selectedIndice,
    selectedIndiceChange
  }: Readonly<{
    multiSelectType: 'and' | 'or'
    label: string
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    selectedIndice: I.List<number>
    selectedIndiceChange: (v: I.List<number>) => void
  }>) => {
    const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)

    const openDialog = useCallback(() => setDialogIsOpen(true), [
      setDialogIsOpen
    ])

    const dialogOkClick = useCallback(
      (v: I.List<number>) => {
        selectedIndiceChange(v)
        setDialogIsOpen(false)
      },
      [selectedIndiceChange, setDialogIsOpen]
    )

    const dialogCancelClick = useCallback(() => {
      setDialogIsOpen(false)
    }, [setDialogIsOpen])

    return (
      <HeaderCellMultiSelectByDialogView
        multiSelectType={multiSelectType}
        selectorOptions={selectorOptions}
        selectedIndice={selectedIndice}
        dialogOpen={dialogIsOpen}
        openDialogClick={openDialog}
        dialogTitle={label}
        dialogOkClick={dialogOkClick}
        dialogCancelClick={dialogCancelClick}
      />
    )
  }
)

HeaderCellMultiSelectWithDialog.displayName = 'HeaderCellMultiSelectWithDialog'
