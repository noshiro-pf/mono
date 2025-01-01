import { FormGroup } from '@blueprintjs/core';
import { memoNamed, useBoolState } from '@noshiro/react-utils';
import { type TinyObservable } from '@noshiro/ts-utils';
import { isEmailString } from '@noshiro/ts-utils-additional';
import { useCallback } from 'react';
import { BpInput, type BpInputProps } from './bp-input.js';

export type BpEmailInputProps = BpInputProps &
  Readonly<{
    formGroupLabel: string;
    onValueChange: (value: string) => void;
    invalidEmailMessage?: string;
    showOtherErrorMessages?: boolean;
    otherErrorMessages?: readonly string[];
    autoFocus?: boolean;
    focus$?: TinyObservable<undefined>;
  }>;

export const BpEmailInput = memoNamed<BpEmailInputProps>(
  'BpEmailInput',
  ({
    formGroupLabel,
    value,
    onValueChange,
    disabled = false,
    placeholder = 'sample@gmail.com',
    invalidEmailMessage = '有効なメールアドレスではありません',
    showOtherErrorMessages = false,
    otherErrorMessages,
    autoFocus,
    focus$,
    onBlur,
    ...props
  }) => {
    const isEmailAddressResult = isEmailString(value ?? '');

    const {
      state: errorsAreHidden,
      setTrue: hideErrors,
      setFalse: showErrorsIfExists,
    } = useBoolState(true);

    const blurHandler: React.FocusEventHandler<HTMLInputElement> = useCallback(
      (ev) => {
        if (onBlur !== undefined) {
          onBlur(ev);
        }
        showErrorsIfExists();
      },
      [onBlur, showErrorsIfExists],
    );

    const valueChangeHandler = useCallback(
      (str: string) => {
        onValueChange(str);
        hideErrors();
      },
      [onValueChange, hideErrors],
    );

    return (
      <FormGroup
        helperText={
          errorsAreHidden || disabled ? undefined : (
            <div>
              {isEmailAddressResult ? undefined : (
                <div>{invalidEmailMessage}</div>
              )}
              {otherErrorMessages === undefined
                ? undefined
                : showOtherErrorMessages
                  ? otherErrorMessages.map((er, index) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <div key={index}>{er}</div>
                    ))
                  : undefined}
            </div>
          )
        }
        intent={'danger'}
        label={formGroupLabel}
      >
        <BpInput
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          disabled={disabled}
          focus$={focus$}
          placeholder={placeholder}
          type='email'
          value={value}
          onBlur={blurHandler}
          onValueChange={valueChangeHandler}
        />
      </FormGroup>
    );
  },
);
