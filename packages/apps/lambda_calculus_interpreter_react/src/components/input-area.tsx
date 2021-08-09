import { memoNamed } from '@noshiro/react-utils';
import type { ChangeEvent } from 'react';
import { useCallback } from 'react';
import styled from 'styled-components';

export const CodeArea = memoNamed<{
  value: string;
  valueChange?: (value: string) => void;
}>('CodeArea', ({ value, valueChange = () => undefined }) => {
  const onChange = useCallback(
    // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
    (ev: ChangeEvent<HTMLTextAreaElement>) => {
      valueChange(ev.target.value);
    },
    [valueChange]
  );
  return <Styled value={value} onChange={onChange} />;
});

const Styled = styled.textarea`
  /* size */
  overflow: hidden;
  max-width: 100%;
  padding: 15px;

  /* border */
  border-radius: 8px;
  box-shadow: inset 0 0 1px 2px #3c3d39, 0 0 15px rgba(0, 0, 0, 0.5);
  border: 1px solid #0b0c0a;

  /* color */
  color: white;
  font-size: 16px;
  font-family: Menlo, Consolas, 'DejaVu Sans Mono', monospace;
  line-height: 1.4;
  caret-color: white;
  background-color: #272822;

  &::placeholder {
    color: #ffffff91;
  }
`;
