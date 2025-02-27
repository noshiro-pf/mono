import styled from '@emotion/styled';
import { memoNamed } from '@noshiro/react-utils';

const CenteringWrapperDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = Readonly<{
  direction: 'column' | 'row';
}>;

export const CenteringWrapper = memoNamed<Props>(
  'CenteringWrapper',
  (props) => <CenteringWrapperDiv style={{ flexDirection: props.direction }} />,
);
