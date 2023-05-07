import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import { createRouter } from '@noshiro/tiny-router-observable';

const { pathname$, queryParams$, back, push, redirect, removeListener } =
  createRouter();

export const usePathname = (): string => useObservableValue(pathname$);
export const useQueryParams = (): DeepReadonly<URLSearchParams> =>
  useObservableValue(queryParams$);

export { pathname$, queryParams$, back, push, redirect, removeListener };
