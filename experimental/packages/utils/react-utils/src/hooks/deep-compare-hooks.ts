import * as deepEqual from 'fast-deep-equal';
import * as React from 'react';

// https://stackoverflow.com/questions/54095994/react-useeffect-comparing-objects
const useDeepCompareMemoize = <D extends React.DependencyList[number]>(
  value: D
): D => {
  const ref = React.useRef<D>(value);

  // eslint-disable-next-line react-hooks/refs
  if (!deepEqual.default(value, ref.current)) {
    // eslint-disable-next-line react-hooks/refs
    ref.current = value;
  }

  // eslint-disable-next-line react-hooks/refs
  return ref.current;
};

export const useDeepCompareEffect = (
  callback: React.EffectCallback,
  dependencies: React.DependencyList
): void => {
  // eslint-disable-next-line react-hooks/rule-suppression
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
};

export const useDeepCompareMemo = <T>(
  callback: () => T,
  dependencies: React.DependencyList
): T =>
  // eslint-disable-next-line react-hooks/rule-suppression
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useMemo(callback, dependencies.map(useDeepCompareMemoize));

export const useDeepCompareCallback = <T>(
  callback: () => T,
  dependencies: React.DependencyList
): (() => T) =>
  // eslint-disable-next-line react-hooks/rule-suppression
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useCallback(callback, dependencies.map(useDeepCompareMemoize));
