import { AsyncData } from 'ts-std-forge';

/**
 * `aria-busy` while a request is pending. synstate-dom writes a `true` as an
 * empty attribute, which `aria-busy` reads as false, so the value is a string.
 */
export const ariaBusy = (
  data: AsyncData<unknown, unknown>,
): 'true' | 'false' => (AsyncData.isPending(data) ? 'true' : 'false');
