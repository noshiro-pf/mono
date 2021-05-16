import type { Hue } from '@noshiro/ts-utils';
import type { IdType } from './id-type';
import { defaultIdMaker } from './id-type';

export type Label = Readonly<{
  id: IdType;
  name: string;
  hue: Hue;
}>;

export const defaultLabel: Label = {
  id: defaultIdMaker(),
  name: '',
  hue: 0,
};
