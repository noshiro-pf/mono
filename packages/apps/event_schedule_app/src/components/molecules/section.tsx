import { Card } from '@blueprintjs/core';
import { BpButton } from '@noshiro/react-blueprintjs-utils';
import { memoNamed } from '@noshiro/react-utils';
import type { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { SectionTitle } from '../atoms';

type Props = Readonly<{
  sectionTitle?: string;
  onCloseClick?: () => void;
}>;

export const Section = memoNamed<PropsWithChildren<Props>>(
  'Section',
  ({ children, sectionTitle, onCloseClick }) => (
    <Root>
      <Card elevation={1}>
        <Header>
          {sectionTitle === undefined ? undefined : (
            <SectionTitle>{sectionTitle}</SectionTitle>
          )}
          {onCloseClick === undefined ? undefined : (
            <BpButton icon={'cross'} minimal={true} onClick={onCloseClick} />
          )}
        </Header>
        {children}
      </Card>
    </Root>
  )
);

const Root = styled.div`
  margin: 10px;
  min-width: 300px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
