import * as t from 'ts-fortress';
import { type DeepReadonly, type UpperAlphabet } from 'ts-type-forge';

export type Group = DeepReadonly<{
  no: UpperAlphabet;
  nameList: string[];
}>;

const numGroupType = t.uintRange({
  start: 2,
  end: 27,
  defaultValue: 2,
});

export const isNumGroups = numGroupType.is;

export type NumGroups = t.TypeOf<typeof numGroupType>;
