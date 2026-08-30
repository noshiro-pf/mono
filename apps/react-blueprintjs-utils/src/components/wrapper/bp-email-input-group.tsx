import { FormGroup } from '@blueprintjs/core';
import { useBoolState } from 'better-react-use-state';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { type Observable as SynstateObservable } from 'synstate';
import { isEmailString } from '../../utils/index.mjs';
import { BpInput, type BpInputProps } from './bp-input.js';

export type BpEmailInputProps = BpInputProps &
  Readonly<{
    formGroupLabel: string;
    onValueChange: (value: string) => void;
    invalidEmailMessage?: string;
    showOtherErrorMessages?: boolean;
    otherErrorMessages?: readonly string[];
    autoFocus?: boolean;
    focus$?: SynstateObservable<undefined>;
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

    const [
      errorsAreHidden,
      { setTrue: hideErrors, setFalse: showErrorsIfExists },
    ] = useBoolState(true);

    const blurHandler: React.FocusEventHandler<HTMLInputElement> =
      React.useCallback(
        (ev) => {
          if (onBlur !== undefined) {
            onBlur(ev);
          }

          showErrorsIfExists();
        },
        [onBlur, showErrorsIfExists],
      );

    const valueChangeHandler = React.useCallback(
      (str: string) => {
        onValueChange(str);

        hideErrors();
      },
      [onValueChange, hideErrors],
    );

    const helperText = React.useMemo(
      () =>
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
        ),
      [
        disabled,
        errorsAreHidden,
        invalidEmailMessage,
        isEmailAddressResult,
        otherErrorMessages,
        showOtherErrorMessages,
      ],
    );

    return (
      <FormGroup
        helperText={helperText}
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
          type={'email'}
          value={value}
          onBlur={blurHandler}
          onValueChange={valueChangeHandler}
        />
      </FormGroup>
    );
  },
);
