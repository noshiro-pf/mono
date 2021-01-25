import { IconButton } from '@material-ui/core'
import FilterListIcon from '@material-ui/icons/FilterList'
import * as I from 'immutable'
import React, { memo, useMemo } from 'react'
import styled from 'styled-components'
import { ISelectorOptionWithViewValue } from '../../../../types/selector-option-with-view-value'
import { FilterByMultiselectDialog } from './filter-by-multiselect-dialog'

const Label = styled.div`
  text-align: center;
  min-width: 100px;
  max-width: 360px;
  flex-grow: 1;
`

const Cell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const generateLabel = (
  selectedIndice: I.List<number>,
  selectorOptions: I.List<ISelectorOptionWithViewValue>,
  multiSelectType: 'and' | 'or'
) => {
  if (!selectedIndice) return ''
  if (selectedIndice.isEmpty()) return 'None'
  if (selectedIndice.size === selectorOptions.size) return 'All'
  if (selectedIndice.size === 1)
    return selectorOptions.get(selectedIndice.get(0, 0), { viewValue: '' })
      .viewValue
  const values = selectedIndice.map(
    (i) => selectorOptions.get(i, { viewValue: '' }).viewValue
  )
  return `${values.join(', ')} (${multiSelectType})`
}

export const HeaderCellMultiSelectByDialogView = memo(
  ({
    multiSelectType,
    selectorOptions,
    selectedIndice,
    dialogOpen,
    openDialogClick,
    dialogTitle,
    dialogCancelClick,
    dialogOkClick,
  }: Readonly<{
    multiSelectType: 'and' | 'or'
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    selectedIndice: I.List<number>
    dialogOpen: boolean
    openDialogClick: () => void
    dialogTitle: string
    dialogCancelClick: () => void
    dialogOkClick: (selectedIndice: I.List<number>) => void
  }>) => {
    const label: string = useMemo(
      () => generateLabel(selectedIndice, selectorOptions, multiSelectType),
      [selectedIndice, selectorOptions, multiSelectType]
    )

    return (
      <div>
        <Cell>
          <Label>{label}</Label>
          {selectorOptions && (
            <IconButton aria-label='Filter' onClick={openDialogClick}>
              <FilterListIcon fontSize='small' />
            </IconButton>
          )}
        </Cell>
        {selectorOptions && (
          <FilterByMultiselectDialog
            open={dialogOpen}
            okClick={dialogOkClick}
            cancelClick={dialogCancelClick}
            title={dialogTitle}
            selectorOptions={selectorOptions}
            selectedIndice={selectedIndice}
          />
        )}
      </div>
    )
  }
)

HeaderCellMultiSelectByDialogView.displayName =
  'HeaderCellMultiSelectByDialogView'
