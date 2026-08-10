import * as t from '@noshiro/io-ts';

export const Year = t.uint32();

export type Year = t.TypeOf<typeof Year>;
