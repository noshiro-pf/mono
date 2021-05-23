import type { FunctionComponent } from 'preact';
import { memo } from 'preact/compat';

export const memoNamed = <Props>(
  displayName: string,
  // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
  fc: FunctionComponent<Readonly<Props>>
): FunctionComponent<Readonly<Props>> => {
  const memoizedComponent = memo(fc);
  memoizedComponent.displayName = displayName;
  return memoizedComponent;
};
