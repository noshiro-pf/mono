import * as React from 'react';

export const usePropToUpdateState = <S, P extends S>(
  prop: P,
  setState: (value: S) => void,
): void => {
  React.useEffect(() => {
    setState(prop);
  }, [setState, prop]);
};
