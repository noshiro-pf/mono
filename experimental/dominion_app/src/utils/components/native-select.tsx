import React, { memo, useCallback } from 'react'
import * as I from 'immutable'
import { TextField } from '@material-ui/core'

export const MySelect = memo(
  ({
    options,
    value,
    valueChange,
    label,
    helperText
  }: Readonly<{
    options: I.List<string>
    value: string
    valueChange: (value: string) => void
    label: string
    helperText?: string
  }>) => {
    const onChange = useCallback(
      (ev: React.ChangeEvent<HTMLSelectElement>) => {
        valueChange(ev.target.value as string)
      },
      [valueChange]
    )

    return (
      // <label>
      //   {label}
      //   <select value={value} onChange={onChange}>
      //     <option value='' />
      //     {options.map(value => (
      //       <option key={value} value={value}>
      //         {value}
      //       </option>
      //     ))}
      //   </select>
      // </label>
      <TextField
        select
        label={label}
        value={value}
        onChange={onChange}
        SelectProps={{
          native: true
        }}
        helperText={helperText || ''}
        margin='normal'
      >
        <option value='' />
        {options.map(value => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </TextField>

      // <FormControl>
      //   <InputLabel htmlFor='native-select'>{label}</InputLabel>
      //   <Select
      //     native
      //     value={value}
      //     onChange={onChange}
      //     inputProps={{ id: 'native-select' }}
      //   >
      //     <option value='' />
      //     {options.map(value => (
      //       <option key={value} value={value}>
      //         {value}
      //       </option>
      //     ))}
      //   </Select>
      // </FormControl>
    )
  }
)

MySelect.displayName = 'MySelect'
