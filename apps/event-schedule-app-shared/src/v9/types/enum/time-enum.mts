import { asSafeUint } from 'ts-data-forge';
import * as t from 'ts-fortress';

export const YearsType = t.safeUint(asSafeUint(1900));

export const Months = t.uintRange({ start: 1, end: 13, defaultValue: 1 });

export const Dates = t.uintRange({ start: 1, end: 32, defaultValue: 1 });

export const Hours = t.uintRange({ start: 0, end: 24, defaultValue: 0 });

export const Minutes = t.uintRange({ start: 0, end: 60, defaultValue: 0 });
