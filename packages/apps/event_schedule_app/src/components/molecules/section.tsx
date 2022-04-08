import { Button, Card } from '@blueprintjs/core';
import type { PropsWithChildren } from 'react';
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
            <Button icon={'cross'} minimal={true} onClick={onCloseClick} />
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
