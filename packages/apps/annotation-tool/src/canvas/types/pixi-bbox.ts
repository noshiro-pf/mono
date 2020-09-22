import { Rect, Rgba } from '@mono/ts-utils';
import { Graphics } from 'pixi.js';
import { IdType } from './id-type';

export type PixiBbox = {
  id: IdType;
  rect: Rect;
  style: {
    borderWidthPx: number;
    borderColor: Rgba;
    faceHighlightColor: Rgba;
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
