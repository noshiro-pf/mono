import { asSafeInt } from 'ts-data-forge';
import type { Brand, SafeInt } from 'ts-type-forge';

export const isPageNumber = (n: SafeInt): n is PageNumber => n >= 1;

export const asPageNumber = (n: number): PageNumber => {
  const i = asSafeInt(n);

  if (!isPageNumber(i)) {
    throw new Error(`${n} is not a page number`);
  }

  return i;
};

/** A page of the product list: 1 or more. */
export type PageNumber = Brand<SafeInt, 'PageNumber'>;

export const firstPage: PageNumber = asPageNumber(1);
