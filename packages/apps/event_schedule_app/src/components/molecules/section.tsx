import { Card } from '@blueprintjs/core';
import { memoNamed } from '@noshiro/react-utils';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { SectionTitle } from '../atoms/section-title';

type Props = Readonly<{
  sectionTitle?: string;
}>;

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
