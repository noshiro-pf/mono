import { FormGroup, InputGroupProps2 } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { isEmailString, TinyObservable } from '@noshiro/ts-utils';
import { BpInput } from './bp-input';

type Props = InputGroupProps2 &
  Readonly<{
    formGroupLabel: string;
    onValueChange: (value: string) => void;
    invalidMessage?: string;
    autoFocus?: boolean;
    focus$?: TinyObservable<undefined>;
  }>;

export const BpEmailInput = memoNamed<Props>(
  'BpEmailInput',
  ({
    formGroupLabel,
    value,
    onValueChange,
    disabled = false,
    placeholder = 'sample@gmail.com',
    invalidMessage = '有効なメールアドレスではありません',
    autoFocus,
    focus$,
    ...props
  }) => {
    const isEmailAddressResult = isEmailString(value ?? '');

    const showError: boolean = !disabled && !isEmailAddressResult;

    return (
      <FormGroup
        label={formGroupLabel}
        helperText={showError ? invalidMessage : undefined}
        intent={showError ? 'danger' : 'primary'}
      >
        <BpInput
          type='email'
          placeholder={placeholder}
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          autoFocus={autoFocus}
          focus$={focus$}
          {...props}
        />
      </FormGroup>
    );
  }
);
