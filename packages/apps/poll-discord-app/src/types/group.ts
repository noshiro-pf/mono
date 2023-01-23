import { type UpperAlphabet } from '@noshiro/ts-utils-additional';

export type Group = DeepReadonly<{
  no: UpperAlphabet;
  nameList: string[];
}>;

export const maxNumGroups = 26;

export type NumGroups =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26;
