import * as I from 'immutable'
import React, { memo } from 'react'
import styled from 'styled-components'
import { FilterType } from '../../types/filter-type'
import { HeaderValueType } from '../../types/header-value-type'
import { ISelectorOptionWithViewValue } from '../../types/selector-option-with-view-value'
import { HeaderCellInput } from './sub-components/header-cell-input/header-cell-input'
import { HeaderCellMultiSelectWithDialog } from './sub-components/header-cell-multiselect/header-cell-multiselect-with-dialog'
import { HeaderCellSelect } from './sub-components/header-cell-select/header-cell-select'

const HeaderCellDefault = styled.div`
  font-size: initial;
  width: max-content;
`

export const SwitchHeadereCellView = memo(
  ({
    filterType,
    label,
    selectorOptions,
    headerValue,
    inputChange,
    selectedIndexChange,
    selectedIndiceChange,
  }: Readonly<{
    filterType: FilterType
    label: string
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    headerValue: HeaderValueType
    inputChange: (v: string) => void
    selectedIndexChange: (v: number) => void
    selectedIndiceChange: (v: I.List<number>) => void
  }>) => {
    switch (filterType) {
      case 'none':
        return <HeaderCellDefault>{label}</HeaderCellDefault>

      case 'input':
        return (
          <HeaderCellInput
            placeholder={label}
            value={headerValue as string}
            valueChange={inputChange}
          />
        )

      case 'select':
        return (
          <HeaderCellSelect
            label={label}
            selectorOptions={selectorOptions}
            selectedIndex={headerValue as number}
            selectedIndexChange={selectedIndexChange}
          />
        )

      case 'multiSelect-and':
        return (
          <HeaderCellMultiSelectWithDialog
            multiSelectType='and'
            label={label}
            selectorOptions={selectorOptions}
            selectedIndice={headerValue as I.List<number>}
            selectedIndiceChange={selectedIndiceChange}
          />
        )

      case 'multiSelect-or':
        return (
          <HeaderCellMultiSelectWithDialog
            multiSelectType='or'
            label={label}
            selectorOptions={selectorOptions}
            selectedIndice={headerValue as I.List<number>}
            selectedIndiceChange={selectedIndiceChange}
          />
        )

      default:
        return <span>{label}</span>
    }
  },
)

SwitchHeadereCellView.displayName = 'SwitchHeadereCellView'
