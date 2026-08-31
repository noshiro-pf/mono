import { type SafeUint } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';

export type Count = ReadonlyRecord<'noLine' | 'oneLine' | 'twoLine', SafeUint>;
