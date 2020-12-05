import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';

interface Props {
  text: string;
  error?: boolean;
  color?: string;
}

export const Description = memoNamed<Props>(
  'Description',
  ({ text, error = false, color }) => (
    <Root style={{ color: color ?? (error ? '#f44336' : '#5c7080') }}>
      {text}
    </Root>
  )
);

const Root = styled.div`
  font-size: smaller;
  margin-bottom: 5px;
`;
