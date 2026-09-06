import * as Preact from 'preact/hooks';

export const usePropToUpdateState = <S, P extends S>(
  prop: P,
  setState: (value: S) => void,
): void => {
  Preact.useEffect(() => {
    setState(prop);
  }, [setState, prop]);
};
