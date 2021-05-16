import type { FunctionComponent } from 'preact';
import { memo } from 'preact/compat';

export const memoNamed = <Props>(
  displayName: string,
  fc: FunctionComponent<Readonly<Props>>
): FunctionComponent<Readonly<Props>> => {
  const memoizedComponent = memo(fc);
  memoizedComponent.displayName = displayName;
  return memoizedComponent;
};
