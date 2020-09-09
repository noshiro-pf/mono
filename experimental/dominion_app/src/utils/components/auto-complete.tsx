import React, { memo } from 'react'
import * as I from 'immutable'
// import CreatableSelect from 'react-select/src/Creatable';
// import { ValueType } from 'react-select/lib/types';

export const AutoComplete = memo(
  ({
    value: valueInput,
    options: optionsInput,
    onChange: onChangeInput,
    placeholder
  }: Readonly<{
    value: string
    options: I.List<string>
    onChange: (v: string) => void
    placeholder: string
  }>) => {
    console.log(valueInput, optionsInput, onChangeInput, placeholder)
    // const value = useMemo(() => ({ value: valueInput, label: valueInput }), [
    //   valueInput
    // ]);
    // const options = useMemo(
    //   () => optionsInput.map(e => ({ value: e, label: e })).toArray(),
    //   [optionsInput]
    // );

    // const onChange = useCallback(
    //   () => {},
    //   // (option: ValueType<{ value: string; label: string }>) => {
    //   //   if (!!option && !Array.isArray(option)) {
    //   //     onChangeInput(option.value);
    //   //   }
    //   // },
    //   [onChangeInput]
    // );

    // const onCreateOption = useCallback(
    //   (inputValue: string) => {
    //     onChangeInput(inputValue);
    //   },
    //   [onChangeInput]
    // );
    // const onInputChange = useCallback(
    //   (value: string) => {
    //     console.log(value);
    //     onChangeInput(value);
    //   },
    //   [onChangeInput]
    // );

    return (
      <div>a</div>
      // <CreatableSelect
      //   isClearable={true}
      //   // classes={classes}
      //   // styles={selectStyles}
      //   // components={components}
      //   options={options}
      //   value={value}
      //   onChange={onChange}
      //   // inputValue={valueInput}
      //   // onInputChange={onInputChange}
      //   onCreateOption={onCreateOption}
      //   placeholder={placeholder}
      // />
    )
  }
)

AutoComplete.displayName = 'AutoComplete'
