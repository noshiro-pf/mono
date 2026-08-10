import styled from '@emotion/styled';
import { memoNamed } from '@noshiro/react-utils';
import { useMemo } from 'react';

type Props = Readonly<{
  direction: 'column' | 'row';
}>;

export const CenteringWrapper = memoNamed<Props>(
  'CenteringWrapper',
  (props) => {
    const style = useMemo(
      () => ({ flexDirection: props.direction }),
      [props.direction],
    );

    return <CenteringWrapperDiv style={style} />;
  },
);

const CenteringWrapperDiv = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
