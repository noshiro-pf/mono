import { FC, memo, NamedExoticComponent } from 'react';

export const memoNamed = <Props>(
  displayName: string,
  fc: FC<Readonly<Props>>
): NamedExoticComponent<Readonly<Props>> => {
  const memoizedComponent = memo(fc);
  memoizedComponent.displayName = displayName;
  return memoizedComponent;
};
