import { rectFrom2Points } from '@noshiro/ts-utils-additional';
import { updateBorderedRectangleGraphics } from '../../functions';
import type { AnnotationCanvasStyle, PixiGlobalObjects } from '../../types';
import type { CanvasAppState } from '../canvas-state-type';

export const onPointerDownOnBackground = (
  state: CanvasAppState,
  mut_canvasStyles: AnnotationCanvasStyle,
  mut_pixiGlobalObjects: PixiGlobalObjects
): void => {
  mut_pixiGlobalObjects.temporaryRect.pixi.visible = true;
  updateBorderedRectangleGraphics(
    mut_pixiGlobalObjects.temporaryRect.pixi,
    rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
    mut_canvasStyles.temporaryRectFaceColor,
    mut_canvasStyles.temporaryRectBorderWidthPx,
    mut_canvasStyles.temporaryRectBorderColor
  );
};
