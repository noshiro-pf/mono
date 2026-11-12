/** How a command words a read or a write that failed. */

import type { ReadError } from 'pr-report-core-v2';

/** A read that failed, as a command says it. */
export const messageOf = (error: ReadError): string =>
  `cannot read ${error.what} (${error.kind}): ${error.message}` as const;

/** A write that failed, as a command says it. */
export const notWritten = (error: ReadError): string =>
  `cannot write ${error.what} (${error.kind}): ${error.message}` as const;
