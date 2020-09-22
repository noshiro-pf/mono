import React, { memo, useCallback } from 'react'
import * as I from 'immutable'

import { ISelectorOptionWithViewValue } from '../../../../types/selector-option-with-view-value'
import { HeaderCellSelectView } from './header-cell-select-view'

export const HeaderCellSelect = memo(
  ({
    label,
    selectorOptions,
    selectedIndex,
    selectedIndexChange
  }: Readonly<{
    label: string
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    selectedIndex: number
    selectedIndexChange: (v: number) => void
  }>) => {
    const reset = useCallback(() => {
      selectedIndexChange(-1)
    }, [selectedIndexChange])

    return (
      <HeaderCellSelectView
        label={label}
        selectorOptions={selectorOptions}
        selectedIndex={selectedIndex}
        selectedIndexChange={selectedIndexChange}
        reset={reset}
      />
    )
  }
)

HeaderCellSelect.displayName = 'HeaderCellSelect'
