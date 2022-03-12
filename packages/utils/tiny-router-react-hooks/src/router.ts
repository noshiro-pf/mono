import { useObservableValue } from '@noshiro/syncflow-react-hooks';
import type { QueryParams } from '@noshiro/tiny-router-observable';
import { createRouter } from '@noshiro/tiny-router-observable';

const { pathname$, queryParams$, back, push, redirect, removeListener } =
  createRouter();

export const usePathname = (): string => useObservableValue(pathname$);
export const useQueryParams = (): QueryParams =>
  useObservableValue(queryParams$);

export { pathname$, queryParams$, back, push, redirect, removeListener };
