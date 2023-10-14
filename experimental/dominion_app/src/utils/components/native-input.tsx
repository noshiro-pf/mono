import { TextField } from '@material-ui/core'
import React, { CSSProperties, memo, useCallback } from 'react'
import { useValueWithDefault } from '../hooks/use-prop-with-default'

export const MyInput = memo(
  ({
    value,
    valueChange,
    label,
    required: requiredInput,
    error: errorInput,
    helperText: helperTextInput,
    style,
    type,
    disabled,
  }: Readonly<{
    value: string | number
    valueChange: (value: string) => void
    label: string
    required?: boolean
    error?: boolean
    helperText?: string
    style?: CSSProperties
    type?: string
    disabled?: boolean
  }>) => {
    const onChange = useCallback(
      (
        ev: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        valueChange(ev.target.value)
      },
      [valueChange],
    )

    const required = useValueWithDefault(requiredInput, false)
    const error = useValueWithDefault(errorInput, false)
    const helperText = useValueWithDefault(helperTextInput, '')

    return (
      <TextField
        style={style}
        required={required}
        label={label}
        value={value}
        onChange={onChange}
        error={error}
        helperText={helperText || ''}
        margin='normal'
        type={type}
        disabled={disabled}
      />
    )
  },
)

MyInput.displayName = 'MyInput'
