import { findElement } from '../external.mjs';

// A destructured binding is a variable declaration too, and the `null` still
// reaches it.
// @sumi-expect-error null/no-null-propagation
export const [first] = [findElement('.foo')] as const;
