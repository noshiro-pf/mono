import { uint32 } from '@noshiro/ts-utils';

export type Count = Readonly<Record<'noLine' | 'oneLine' | 'twoLine', uint32>>;
