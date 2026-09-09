import { findElement } from '../external.mjs';

// @sumi-expect-error null/no-null-propagation
export const element = findElement('.foo');
