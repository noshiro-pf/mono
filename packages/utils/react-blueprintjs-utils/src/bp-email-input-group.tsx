import { FormGroup } from '@blueprintjs/core';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import type { TinyObservable } from '@noshiro/ts-utils';
import { IList, isEmailString } from '@noshiro/ts-utils';
import { useCallback } from 'react';
import type { BpInputProps } from './bp-input';
import { BpInput } from './bp-input';

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

    const [errorsAreHidden, hideErrors, showErrorsIfExists] =
      useBooleanState(true);

    const blurHandler: React.FocusEventHandler<HTMLInputElement> = useCallback(
      (ev) => {
        if (onBlur !== undefined) {
          onBlur(ev);
        }
        showErrorsIfExists();
      },
      [onBlur, showErrorsIfExists]
    );

    const valueChangeHandler = useCallback(
      (str: string) => {
        onValueChange(str);
        hideErrors();
      },
      [onValueChange, hideErrors]
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
                ? IList.map(otherErrorMessages, (er, index) => (
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
          autoFocus={autoFocus}
          disabled={disabled}
          focus$={focus$}
          placeholder={placeholder}
          type='email'
          value={value}
          onBlur={blurHandler}
          onValueChange={valueChangeHandler}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      </FormGroup>
    );
  }
);
