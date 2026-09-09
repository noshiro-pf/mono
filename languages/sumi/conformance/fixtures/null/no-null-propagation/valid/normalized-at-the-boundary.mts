import { findElement } from '../external.mjs';

// The `null` is normalized where it enters, so no declaration carries it.
export const element = findElement('.foo') ?? undefined;

export const width = (findElement('.bar') ?? undefined)?.length;
