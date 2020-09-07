import { FC, memo } from 'react';

export const memoNamed = <Props>(
  displayName: string,
  fc: FC<Readonly<Props>>
): React.NamedExoticComponent<Readonly<Props>> => {
  const memoizedComponent = memo(fc);
  memoizedComponent.displayName = displayName;
  return memoizedComponent;
};
