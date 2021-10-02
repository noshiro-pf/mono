import { useStreamValue } from '@noshiro/syncflow-preact-hooks';
import type { QueryParams } from '@noshiro/tiny-router-observable';
import { createRouter } from '@noshiro/tiny-router-observable';

const { pathname$, queryParams$, back, push, redirect, removeListener } =
  createRouter();

export const usePathname = (): string => useStreamValue(pathname$);
export const useQueryParams = (): QueryParams => useStreamValue(queryParams$);

export { pathname$, queryParams$, back, push, redirect, removeListener };
