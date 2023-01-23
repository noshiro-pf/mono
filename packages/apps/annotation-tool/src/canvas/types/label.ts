import { type Hue } from '@noshiro/ts-utils-additional';
import { defaultIdMaker, type IdType } from './id-type';

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
