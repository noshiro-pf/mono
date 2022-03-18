import type { Point } from '@noshiro/ts-utils';
import { rectFrom2Points } from '@noshiro/ts-utils';
import {
  moveBbox,
  resizeBbox,
  updateBorderedRectangleGraphics,
} from '../../functions';
import type { PixiApp } from '../../types';
import type { CanvasAppState } from '../canvas-state-type';

export const onPointerMove = (
  mut_state: CanvasAppState,
  pointerPos: Point,
  pixiApp: PixiApp
): void => {
  mut_state.pointerPos = pointerPos;
  pixiApp.verticalLine.position.set(pointerPos.x, 0);
  pixiApp.horizontalLine.position.set(0, pointerPos.y);

  if (mut_state.grabbingObject.type !== undefined) {
    mut_state.dragEndPoint = pointerPos;
  }

  switch (mut_state.grabbingObject.type) {
    case 'background':
      updateBorderedRectangleGraphics(
        pixiApp.temporaryRect.pixi,
        rectFrom2Points(mut_state.dragStartPoint, mut_state.dragEndPoint),
        pixiApp.temporaryRect.style.faceColor,
        pixiApp.temporaryRect.style.borderWidthPx,
        pixiApp.temporaryRect.style.borderColor
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
