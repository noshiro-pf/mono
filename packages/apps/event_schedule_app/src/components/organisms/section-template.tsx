import { Card } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { SectionTitle } from '../atoms/section-title';

const Root = styled.div`
  margin: 10px;
  min-width: 300px;
`;

export const Section = memoNamed<
  PropsWithChildren<{
    sectionTitle: string;
  }>
>('Section', ({ children, sectionTitle }) => (
  <Root>
    <Card elevation={1}>
      <SectionTitle>{sectionTitle}</SectionTitle>
      {children}
    </Card>
  </Root>
));
