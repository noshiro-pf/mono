import * as React from 'react';

export const useValueAsRef = <T,>(value: T): React.RefObject<T> => {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
};
