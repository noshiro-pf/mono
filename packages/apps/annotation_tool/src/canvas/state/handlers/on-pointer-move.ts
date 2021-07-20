import type { Point } from '@noshiro/ts-utils';
import { rectFrom2Points } from '@noshiro/ts-utils';
import {
  moveBbox,
  resizeBbox,
  updateBorderedRectangleGraphics,
} from '../../functions';
import type { PixiGlobalObjects } from '../../types';
import type { CanvasAppState } from '../canvas-state-type';

export const onPointerMove = (
  state: CanvasAppState,
  pointerPos: Point,
  pixiGlobalObjects: PixiGlobalObjects
): void => {
  state.pointerPos = pointerPos;
  pixiGlobalObjects.verticalLine.position.set(pointerPos.x, 0);
  pixiGlobalObjects.horizontalLine.position.set(0, pointerPos.y);

  if (state.grabbingObject.type !== undefined) {
    state.dragEndPoint = pointerPos;
  }

  switch (state.grabbingObject.type) {
    case 'background':
      updateBorderedRectangleGraphics(
        pixiGlobalObjects.temporaryRect.pixi,
        rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
        pixiGlobalObjects.temporaryRect.style.faceColor,
        pixiGlobalObjects.temporaryRect.style.borderWidthPx,
        pixiGlobalObjects.temporaryRect.style.borderColor
      );
      break;
    case 'bbox-face':
      moveBbox(
        state.grabbingObject.pixiBbox,
        state.grabbingObject.rectPrevious,
        state.dragStartPoint,
        state.dragEndPoint
      );
      break;
    case 'bbox-point':
      resizeBbox(
        state.grabbingObject.pixiBbox,
        state.grabbingObject.rectPrevious,
        state.grabbingObject.direction,
        state.dragStartPoint,
        state.dragEndPoint
      );
      break;
    default:
      break;
  }
};
