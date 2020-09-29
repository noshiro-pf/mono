import { Point, Writeable } from '@mono/ts-utils';
import { PixiBbox } from '../types/pixi-bbox';

export type CanvasAppState = {
  pointerPos: Writeable<Point>;
  dragStartPoint: Writeable<Point>;
  dragEndPoint: Writeable<Point>;
  grabbingObject:
    | { type: undefined }
    | { type: 'background' }
    | { type: 'bbox-face'; pixiBbox: PixiBbox }
    | { type: 'bbox-edge'; pixiBbox: PixiBbox }
    | { type: 'bbox-point'; pixiBbox: PixiBbox };
  bboxList: PixiBbox[];
};

export const defaultCanvasAppState: CanvasAppState = {
  pointerPos: { x: 0, y: 0 },
  dragStartPoint: { x: 0, y: 0 },
  dragEndPoint: { x: 0, y: 0 },
  grabbingObject: { type: undefined },
  bboxList: [],
};
