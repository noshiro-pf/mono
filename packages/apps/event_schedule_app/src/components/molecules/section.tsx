import { Card } from '@blueprintjs/core';
import { memoNamed } from '@mono/react-utils';
import React, { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { SectionTitle } from '../atoms/section-title';

interface Props {
  sectionTitle?: string;
}

export const Section = memoNamed<PropsWithChildren<Props>>(
  'Section',
  ({ children, sectionTitle }) => (
    <Root>
      <Card elevation={1}>
        {sectionTitle === undefined ? undefined : (
          <SectionTitle>{sectionTitle}</SectionTitle>
        )}
        {children}
      </Card>
    </Root>
  )
);

const Root = styled.div`
  margin: 10px;
  min-width: 300px;
`;
