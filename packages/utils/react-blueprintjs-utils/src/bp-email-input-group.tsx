import { FormGroup } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import type { TinyObservable } from '@noshiro/ts-utils';
import { isEmailString } from '@noshiro/ts-utils';
import type { BpInputProps } from './bp-input';
import { BpInput } from './bp-input';

export type BpEmailInputProps = BpInputProps &
  Readonly<{
    formGroupLabel: string;
    onValueChange: (value: string) => void;
    invalidMessage?: string;
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
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
        />
      </FormGroup>
    );
  }
);
