import * as t from '@noshiro/io-ts';

export const yenType = t.simpleBrandedNumber('Yen', 0);

export const toYen = yenType.cast;

export type Yen = t.TypeOf<typeof yenType>;
