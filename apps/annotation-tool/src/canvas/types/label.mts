/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Hue } from 'ts-utils-additional';
import { defaultIdMaker, type IdType } from './id-type.mjs';

export type Label = Readonly<{
  id: IdType;
  name: string;
  hue: Hue;
}>;

export const defaultLabel: Label = {
  id: defaultIdMaker(),
  name: '',
  hue: 0,
} as const;
