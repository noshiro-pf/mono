import { type Rect, type Rgba } from '@noshiro/ts-utils-additional';
import { type Graphics } from 'pixi.js';
import { type IdType } from './id-type';

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
