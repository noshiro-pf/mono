import React, { memo, useCallback, CSSProperties } from 'react'
import * as I from 'immutable'
import {
  // IconButton,
  // MenuItem,
  // TextField,
  Select,
  FormControl,
  InputLabel
  // InputAdornment
} from '@material-ui/core'
// import ClearIcon from '@material-ui/icons/Clear'

import { ISelectorOptionWithViewValue } from '../../../../types/selector-option-with-view-value'

const selectStyle: CSSProperties = {
  minWidth: '180px',
  maxWidth: '360px'
}

export const HeaderCellSelectView = memo(
  ({
    label,
    selectorOptions,
    selectedIndex,
    selectedIndexChange,
    reset
  }: Readonly<{
    label: string
    selectorOptions: I.List<ISelectorOptionWithViewValue>
    selectedIndex: number
    selectedIndexChange: (index: number) => void
    reset: () => void
  }>) => {
    const selectedIndexOnChange = useCallback(
      (
        ev: React.ChangeEvent<{
          name?: string | undefined
          value: unknown
        }>
      ) => {
        const value = Number(ev.target.value)
        if (value < 0) {
          reset()
        } else {
          selectedIndexChange(value)
        }
      },
      [selectedIndexChange, reset]
    )

    return (
      <div>
        {selectorOptions && (
          <FormControl>
            <InputLabel htmlFor='header-cell-select'>{label}</InputLabel>
            <Select
              style={selectStyle}
              native
              value={selectedIndex}
              onChange={selectedIndexOnChange}
              inputProps={{
                name: 'header-cell-select',
                id: 'header-cell-select'
              }}
            >
              <option value={-1} />
              {selectorOptions.map((option, i) => (
                <option key={i} value={i}>
                  {option.viewValue}
                </option>
              ))}
            </Select>
          </FormControl>

          // <TextField
          //   style={selectStyle}
          //   select
          //   label={label}
          //   value={selectedIndex}
          //   onChange={selectedIndexOnChange}
          //   InputProps={{
          //     startAdornment: <span>&nbsp;</span>,
          //     endAdornment: (
          //       <InputAdornment position='end'>
          //         <IconButton aria-label='Reset Selection' onClick={resetClick}>
          //           <ClearIcon fontSize='small' />
          //         </IconButton>
          //       </InputAdornment>
          //     )
          //   }}
          // >
          //   {selectorOptions.map((option, i) => (
          //     <MenuItem key={i} value={i}>
          //       {option.viewValue}
          //     </MenuItem>
          //   ))}
          // </TextField>
        )}
      </div>
    )
  }
)

HeaderCellSelectView.displayName = 'HeaderCellSelectView'
