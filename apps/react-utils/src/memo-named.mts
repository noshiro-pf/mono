import * as React from 'react';

export const memoNamed = <Props,>(
  displayName: string,

  fc: React.FC<Readonly<Props>>,
): React.NamedExoticComponent<Readonly<Props>> => {
  const mut_memoizedComponent = React.memo<Readonly<Props>>(fc);

  mut_memoizedComponent.displayName = displayName;

  return mut_memoizedComponent;
};
