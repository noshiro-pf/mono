import { FC } from 'react';
import styled from 'styled-components';

const CenteringWrapperDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = Readonly<{
  direction: 'row' | 'column';
}>;

export const CenteringWrapper: FC<Props> = (props: Props) => (
  <CenteringWrapperDiv style={{ flexDirection: props.direction }} />
);
