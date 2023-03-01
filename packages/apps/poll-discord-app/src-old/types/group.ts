import * as t from '@noshiro/io-ts';
import type { UpperAlphabet } from '@noshiro/ts-utils-additional';

export type Group = DeepReadonly<{
  no: UpperAlphabet;
  nameList: string[];
}>;

export const maxNumGroups = 26;

const numGroupsTypeDef = t.uintRange(2, maxNumGroups, 2);

export const isNumGroups = numGroupsTypeDef.is;

export type NumGroups = t.TypeOf<typeof numGroupsTypeDef>;
