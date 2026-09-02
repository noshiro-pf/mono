import { type TypeOf, uint32 } from 'ts-fortress';

export const Year = uint32();

export type Year = TypeOf<typeof Year>;
