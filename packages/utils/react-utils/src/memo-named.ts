import { FC, memo, MemoExoticComponent } from 'react';

export const memoNamed = <Props>(
  displayName: string,
  fc: FC<Props>
): MemoExoticComponent<FC<Readonly<Props>>> => {
  const memoizedComponent = memo(fc);
  memoizedComponent.displayName = displayName;
  return memoizedComponent;
};
