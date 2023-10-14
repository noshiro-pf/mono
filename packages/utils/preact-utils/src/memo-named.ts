// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { memo } from 'preact/compat';

export const memoNamed = <Props>(
  displayName: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  fc: preact.FunctionComponent<Readonly<Props>>,
): preact.FunctionComponent<Readonly<Props>> => {
  const mut_memoizedComponent = memo(fc);
  mut_memoizedComponent.displayName = displayName;
  return mut_memoizedComponent;
};
