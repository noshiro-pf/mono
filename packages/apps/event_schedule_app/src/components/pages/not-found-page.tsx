import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';

const RootCentered = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.div`
  padding: 10px;
  font-size: large;
`;

export const NotFoundPage = memoNamed<{}>('NotFoundPage', () => (
  <RootCentered>
    <Title></Title>
  </RootCentered>
));
