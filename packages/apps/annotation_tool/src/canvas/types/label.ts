import { Hue } from '@noshiro/ts-utils';
import { defaultIdMaker, IdType } from './id-type';

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
