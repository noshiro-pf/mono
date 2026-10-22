import { Button, Card } from '@blueprintjs/core';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { memoNamed } from 'react-utils';
import { mapNullable } from 'ts-data-forge';
import { SectionTitle } from '../atoms/index.mjs';

type Props = Readonly<{ sectionTitle?: string; onCloseClick?: () => void }>;

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
          {mapNullable(sectionTitle, (s) => (
            <SectionTitle>{s}</SectionTitle>
          ))}
          {mapNullable(onCloseClick, (f) => (
            <Button icon={'cross'} variant={'minimal'} onClick={f} />
          ))}
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
