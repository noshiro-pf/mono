import * as t from 'ts-fortress';

export const Yen = t.brandedNumber({ typeName: 'Yen', defaultValue: 0 });

export type Yen = t.TypeOf<typeof Yen>;
