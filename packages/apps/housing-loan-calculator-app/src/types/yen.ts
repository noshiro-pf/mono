import * as t from '@noshiro/io-ts';

export const Yen = t.simpleBrandedNumber('Yen', 0);

export type Yen = t.TypeOf<typeof Yen>;
