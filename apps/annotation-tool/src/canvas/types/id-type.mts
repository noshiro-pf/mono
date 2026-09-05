/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { v4 as uuidv4 } from 'uuid';

/** Canvas objectのid React Node の key にも用いるため symbol は使用していない． */
export type IdType = string;

export const defaultIdMaker: () => IdType = uuidv4;

export const defaultId = uuidv4();
