/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Sprite } from 'pixi.js-legacy';
import { type Mutable } from 'ts-type-forge';
import { type Point, type Rect } from 'ts-utils-additional';
import { type Direction } from '../functions/index.mjs';
import { type PixiBbox, type PixiTempRect } from '../types/index.mjs';

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
} as const;
