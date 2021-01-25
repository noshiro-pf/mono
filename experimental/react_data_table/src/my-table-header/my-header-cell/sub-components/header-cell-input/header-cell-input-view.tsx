import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'
import React, { ChangeEvent, CSSProperties, memo, useCallback } from 'react'

const inputStyle: CSSProperties = {
  minWidth: '120px',
}

export const HeaderCellInputView = memo(
  ({
    placeholder,
    value,
    valueChange,
    resetClick,
  }: Readonly<{
    placeholder: string
    value: string
    valueChange: (value: string) => void
    resetClick: () => void
  }>) => {
    const onInput = useCallback(
      (ev: ChangeEvent<HTMLInputElement>) => valueChange(ev.target.value || ''),
      [valueChange]
    )

    return (
      <FormControl>
        <InputLabel shrink htmlFor='input'>
          {placeholder}
        </InputLabel>
        <Input
          style={inputStyle}
          id='input'
          type='text'
          value={value}
          onChange={onInput}
          endAdornment={
            <InputAdornment position='end'>
              <IconButton aria-label='Reset Input' onClick={resetClick}>
                <ClearIcon fontSize='small' />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    )
  }
)

HeaderCellInputView.displayName = 'HeaderCellInputView'
