import { Autocomplete, TextField } from '@mui/material';
import type * as React from 'react';
import { castMutable } from 'ts-data-forge';

// Example: Material-UI Autocomplete
const SomeComponent: React.FC = () => (
  <Autocomplete
    options={castMutable(readonlyOptions)}
    renderInput={({
      InputLabelProps,
      InputProps,
      disabled,
      fullWidth,
      id,
      inputProps,
      size,
    }) => (
      <TextField
        slotProps={{
          inputLabel: InputLabelProps,
          input: InputProps,
          htmlInput: inputProps,
        }}
        disabled={disabled}
        fullWidth={fullWidth}
        id={id}
        size={size}
        placeholder="Select an option"
      />
    )}
  />
);

const readonlyOptions = ['Option 1', 'Option 2', 'Option 3'] as const;

// embed-sample-code-ignore-below
const noop = (..._args: readonly unknown[]) => {};

noop(SomeComponent);
