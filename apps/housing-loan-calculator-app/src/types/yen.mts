import { brandedNumber, type TypeOf } from 'ts-fortress';

export const Yen = brandedNumber({ typeName: 'Yen', defaultValue: 0 });

export type Yen = TypeOf<typeof Yen>;
