import { useEffect } from 'preact/compat';

export const usePropToUpdateState = <S, P extends S>(
  prop: P,
  setState: (value: S) => void
): void => {
  useEffect(() => {
    setState(prop);
  }, [setState, prop]);
};
