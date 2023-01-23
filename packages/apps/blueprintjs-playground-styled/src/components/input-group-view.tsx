import { memoNamed } from '@noshiro/react-utils';
import { type DetailedHTMLProps, type InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { ptInput } from '../style-definitions';

type Props = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const InputGroupView = memoNamed<Props>(
  'InputGroupView',
  ({ value, placeholder, disabled, onChange }) => (
    <InputGroup disabled={disabled}>
      <InputView
        disabled={disabled}
        placeholder={placeholder}
        type='text'
        value={value}
        onChange={onChange}
      />
    </InputGroup>
  )
);

type StyleProps = Readonly<{ disabled?: boolean }>;

const InputGroup = styled.div`
  display: block;
  position: relative;

  ${(props: StyleProps) =>
    props.disabled === true
      ? css`
          cursor: not-allowed;
        `
      : css``}
`;

const InputView = styled.input`
  ${ptInput}

  /* .bp3-input-group .bp3-input */
  position: relative;
  width: 100%;
`;
