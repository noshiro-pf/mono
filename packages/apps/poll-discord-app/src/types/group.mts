import * as t from '@noshiro/io-ts';

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
