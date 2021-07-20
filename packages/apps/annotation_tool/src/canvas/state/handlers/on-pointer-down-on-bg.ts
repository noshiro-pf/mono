import { rectFrom2Points } from '@noshiro/ts-utils';
import { updateBorderedRectangleGraphics } from '../../functions';
import type { AnnotationCanvasStyle, PixiGlobalObjects } from '../../types';
import type { CanvasAppState } from '../canvas-state-type';

export const onPointerDownOnBackground = (
  state: CanvasAppState,
  canvasStyles: AnnotationCanvasStyle,
  pixiGlobalObjects: PixiGlobalObjects
): void => {
  pixiGlobalObjects.temporaryRect.pixi.visible = true;
  updateBorderedRectangleGraphics(
    pixiGlobalObjects.temporaryRect.pixi,
    rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
    canvasStyles.temporaryRectFaceColor,
    canvasStyles.temporaryRectBorderWidthPx,
    canvasStyles.temporaryRectBorderColor
  );
};
