/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Graphics } from 'pixi.js-legacy';
import { type Rect, type Rgba } from 'ts-utils-additional';
import { type IdType } from './id-type.mjs';

export type PixiBbox = {
  readonly id: IdType;
  rect: Rect;
  readonly style: {
    borderWidthPx: number;
    borderColor: Rgba;
    faceHighlightColor: Rgba;
    pointWidthPxHalf: number;
  };
  pixi: {
    face: Graphics;
    points: {
      nw: Graphics;
      n_: Graphics;
      ne: Graphics;
      w_: Graphics;
      e_: Graphics;
      sw: Graphics;
      s_: Graphics;
      se: Graphics;
    };
  };
};
