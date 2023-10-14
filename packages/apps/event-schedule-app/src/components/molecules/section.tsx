import { Button, Card } from '@blueprintjs/core';
import { SectionTitle } from '../atoms';

type Props = Readonly<{
  sectionTitle?: string;
  onCloseClick?: () => void;
}>;

export const Section = memoNamed<React.PropsWithChildren<Props>>(
  'Section',
  ({ children, sectionTitle, onCloseClick }) => (
    <div
      css={css`
        margin: 10px;
        min-width: 300px;
      `}
    >
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
    </div>
  ),
);

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
