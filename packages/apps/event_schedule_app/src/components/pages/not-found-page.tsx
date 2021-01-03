import { memoNamed } from '@mono/react-utils';
import React from 'react';
import styled from 'styled-components';
import { texts } from '../../constants/texts';

export const NotFoundPage = memoNamed<Record<string, void>>(
  'NotFoundPage',
  () => <Title>{texts.pageNotFound}</Title>
);

const Title = styled.div`
  margin: 20px;
  font-size: large;
`;
