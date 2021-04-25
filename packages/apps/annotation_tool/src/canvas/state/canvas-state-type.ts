import { Point, Rect, Writable } from '@noshiro/ts-utils';
import { Sprite } from 'pixi.js';
import { Direction } from '../functions/bbox-points';
import { PixiBbox } from '../types/pixi-bbox';
import { PixiTempRect } from '../types/pixi-temp-rect';

export type CanvasAppState = {
  pointerPos: Writable<Point>;
  dragStartPoint: Writable<Point>;
  dragEndPoint: Writable<Point>;
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
