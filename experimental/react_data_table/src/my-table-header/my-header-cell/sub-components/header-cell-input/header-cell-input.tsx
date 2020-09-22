import React, { memo, useCallback } from 'react'
import { HeaderCellInputView } from './header-cell-input-view'

export const HeaderCellInput = memo(
  ({
    placeholder,
    value,
    valueChange
  }: Readonly<{
    placeholder: string
    value: string
    valueChange: (v: string) => void
  }>) => {
    const resetClick = useCallback(() => {
      valueChange('')
    }, [valueChange])

    return (
      <HeaderCellInputView
        value={value}
        placeholder={placeholder}
        valueChange={valueChange}
        resetClick={resetClick}
      />
    )
  }
)

HeaderCellInput.displayName = 'HeaderCellInput'
