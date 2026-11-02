import { asSafeInt } from 'ts-data-forge';
import type { Brand, SafeInt } from 'ts-type-forge';

/** A page of the product list: 1 or more. */
export type PageNumber = Brand<SafeInt, 'PageNumber'>;

export const isPageNumber = (n: SafeInt): n is PageNumber => n >= 1;

export const asPageNumber = (n: number): PageNumber => {
  const i = asSafeInt(n);

  if (!isPageNumber(i)) {
    throw new Error(`${n} is not a page number`);
  }

  return i;
};

export const firstPage: PageNumber = asPageNumber(1);
