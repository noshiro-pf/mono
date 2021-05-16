import { memoNamed } from '@noshiro/react-utils';
import type { CSSProperties, PropsWithChildren } from 'react';
import styled from 'styled-components';

const CellContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = PropsWithChildren<{
  style?: CSSProperties;
}>;

export const Th = memoNamed<Props>('Th', ({ children, style }) => (
  <th style={style}>
    <CellContainer>{children}</CellContainer>
  </th>
));

export const Td = memoNamed<Props>('Td', ({ children, style }) => (
  <td style={style}>
    <CellContainer>{children}</CellContainer>
  </td>
));
