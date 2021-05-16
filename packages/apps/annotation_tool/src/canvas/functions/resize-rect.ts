import type { Point, Rect } from '@noshiro/ts-utils';
import { normalizeRect } from '@noshiro/ts-utils';
import type { Direction } from './bbox-points';

const resizeRectSub = (
  rectPrevious: Rect,
  pointDirectionToPinch: Direction,
  dragVector: Point
): Rect => {
  switch (pointDirectionToPinch) {
    case 'nw':
      return {
        left: rectPrevious.left + dragVector.x,
        top: rectPrevious.top + dragVector.y,
        width: rectPrevious.width - dragVector.x,
        height: rectPrevious.height - dragVector.y,
      };
    case 'n_':
      return {
        left: rectPrevious.left,
        top: rectPrevious.top + dragVector.y,
        width: rectPrevious.width,
        height: rectPrevious.height - dragVector.y,
      };
    case 'ne':
      return {
        left: rectPrevious.left,
        top: rectPrevious.top + dragVector.y,
        width: rectPrevious.width + dragVector.x,
        height: rectPrevious.height - dragVector.y,
      };
    case 'w_':
      return {
        left: rectPrevious.left + dragVector.x,
        top: rectPrevious.top,
        width: rectPrevious.width - dragVector.x,
        height: rectPrevious.height,
      };
    case 'e_':
      return {
        left: rectPrevious.left,
        top: rectPrevious.top,
        width: rectPrevious.width + dragVector.x,
        height: rectPrevious.height,
      };
    case 'sw':
      return {
        left: rectPrevious.left + dragVector.x,
        top: rectPrevious.top,
        width: rectPrevious.width - dragVector.x,
        height: rectPrevious.height + dragVector.y,
      };
    case 's_':
      return {
        left: rectPrevious.left,
        top: rectPrevious.top,
        width: rectPrevious.width,
        height: rectPrevious.height + dragVector.y,
      };
    case 'se':
      return {
        left: rectPrevious.left,
        top: rectPrevious.top,
        width: rectPrevious.width + dragVector.x,
        height: rectPrevious.height + dragVector.y,
      };
  }
};

export const resizeRect = (
  rectPrevious: Rect,
  pointDirectionToPinch: Direction,
  movePointFrom: Point,
  movePointTo: Point
): Rect =>
  normalizeRect(
    resizeRectSub(rectPrevious, pointDirectionToPinch, {
      x: movePointTo.x - movePointFrom.x,
      y: movePointTo.y - movePointFrom.y,
    })
  );
