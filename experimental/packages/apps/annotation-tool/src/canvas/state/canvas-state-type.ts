import { type Point, type Rect } from '@noshiro/ts-utils-additional';
import { type Sprite } from 'pixi.js-legacy';
import { type Direction } from '../functions';
import { type PixiBbox, type PixiTempRect } from '../types';

export type CanvasAppState = {
  pointerPos: Mutable<Point>;
  dragStartPoint: Mutable<Point>;
  dragEndPoint: Mutable<Point>;
  grabbingObject: Readonly<
    | {
        type: 'bbox-point';
        pixiBbox: PixiBbox;
        rectPrevious: Rect;
        direction: Direction;
      }
    | { type: 'background' }
    | { type: 'bbox-edge'; pixiBbox: PixiBbox; rectPrevious: Rect }
    | { type: 'bbox-face'; pixiBbox: PixiBbox; rectPrevious: Rect }
    | { type: undefined }
  >;

  verticalLine: Sprite | undefined;
  horizontalLine: Sprite | undefined;
  temporaryRect: PixiTempRect | undefined;
  bboxList: PixiBbox[];
};

export const defaultCanvasAppState: CanvasAppState = {
  pointerPos: { x: 0, y: 0 },
  dragStartPoint: { x: 0, y: 0 },
  dragEndPoint: { x: 0, y: 0 },
  grabbingObject: { type: undefined },
  verticalLine: undefined,
  horizontalLine: undefined,
  temporaryRect: undefined,
  bboxList: [],
};
