import type { Point } from '@noshiro/ts-utils-additional';
import { rectFrom2Points } from '@noshiro/ts-utils-additional';
import {
  moveBbox,
  resizeBbox,
  updateBorderedRectangleGraphics,
} from '../../functions';
import type { PixiGlobalObjects } from '../../types';
import type { CanvasAppState } from '../canvas-state-type';

export const onPointerMove = (
  mut_state: CanvasAppState,
  pointerPos: Point,
  pixiGlobalObjects: PixiGlobalObjects
): void => {
  mut_state.pointerPos = pointerPos;
  pixiGlobalObjects.verticalLine.position.set(pointerPos.x, 0);
  pixiGlobalObjects.horizontalLine.position.set(0, pointerPos.y);

  if (mut_state.grabbingObject.type !== undefined) {
    mut_state.dragEndPoint = pointerPos;
  }

  switch (mut_state.grabbingObject.type) {
    case 'background':
      updateBorderedRectangleGraphics(
        pixiGlobalObjects.temporaryRect.pixi,
        rectFrom2Points(mut_state.dragStartPoint, mut_state.dragEndPoint),
        pixiGlobalObjects.temporaryRect.style.faceColor,
        pixiGlobalObjects.temporaryRect.style.borderWidthPx,
        pixiGlobalObjects.temporaryRect.style.borderColor
      );
      break;
    case 'bbox-face':
      moveBbox(
        mut_state.grabbingObject.pixiBbox,
        mut_state.grabbingObject.rectPrevious,
        mut_state.dragStartPoint,
        mut_state.dragEndPoint
      );
      break;
    case 'bbox-point':
      resizeBbox(
        mut_state.grabbingObject.pixiBbox,
        mut_state.grabbingObject.rectPrevious,
        mut_state.grabbingObject.direction,
        mut_state.dragStartPoint,
        mut_state.dragEndPoint
      );
      break;
    default:
      break;
  }
};
