// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { memo } from 'react';

export const memoNamed = <Props,>(
  displayName: string,

  fc: React.FC<Readonly<Props>>,
): React.NamedExoticComponent<Readonly<Props>> => {
  const mut_memoizedComponent = memo(fc);
  mut_memoizedComponent.displayName = displayName;
  return mut_memoizedComponent;
};
