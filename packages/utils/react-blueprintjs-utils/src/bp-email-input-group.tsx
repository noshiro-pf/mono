import { FormGroup, IInputGroupProps } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import { isEmailString, TinyObservable } from '@mono/ts-utils';
import styled from 'styled-components';
import { BpInput } from './bp-input';

interface Props extends IInputGroupProps {
  formGroupLabel: string;
  onValueChange: (value: string) => void;
  invalidMessage?: string;
  autoFocus?: boolean;
  focus$?: TinyObservable<void>;
}

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

    return (
      <FormGroup label={formGroupLabel}>
        <BpInput
          type='email'
          intent={isEmailAddressResult ? 'none' : 'danger'}
          placeholder={placeholder}
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          autoFocus={autoFocus}
          focus$={focus$}
          {...props}
        />
        {disabled || isEmailAddressResult ? undefined : (
          <HelperText className='bp3-form-helper-text'>
            {invalidMessage}
          </HelperText>
        )}
      </FormGroup>
    );
  }
);

const HelperText = styled.div`
  color: #f44336 !important;
`;
