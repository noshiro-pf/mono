import styled from '@emotion/styled';
import * as React from 'react';
import { memoNamed } from 'react-utils';

type Props = Readonly<{
  direction: 'column' | 'row';
}>;

export const CenteringWrapper = memoNamed<Props>(
  'CenteringWrapper',
  (props) => {
    const style = React.useMemo(
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
