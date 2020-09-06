import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  background-color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-style: solid;
  border-width: 2px;
  border-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const DiceNumber = memoNamed<Readonly<{ n: number; opacity: number }>>(
  'DiceNumber',
  ({ n, opacity }) => (
    <Wrapper style={{ borderColor: `rgba(143, 186, 255, ${opacity})` }}>
      {n < 1 ? 0 : n}
    </Wrapper>
  )
);
