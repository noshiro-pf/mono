import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';

const Root = styled.div`
  font-size: smaller;
  margin-bottom: 5px;
`;

export const Description = memoNamed<{
  text: string;
  error?: boolean;
  color?: string;
}>('Description', ({ text, error = false, color }) => (
  <Root style={{ color: color ?? (error ? '#f44336' : '#5c7080') }}>
    {text}
  </Root>
));
