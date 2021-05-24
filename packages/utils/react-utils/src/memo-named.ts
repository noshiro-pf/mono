import type { FC, NamedExoticComponent } from 'react';
import { memo } from 'react';

export const memoNamed = <Props>(
  displayName: string,
  // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
  fc: FC<Readonly<Props>>
): NamedExoticComponent<Readonly<Props>> => {
  const memoizedComponent = memo(fc);
  memoizedComponent.displayName = displayName;
  return memoizedComponent;
};
