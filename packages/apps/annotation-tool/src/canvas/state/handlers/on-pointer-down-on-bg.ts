import { rectFrom2Points } from '@noshiro/ts-utils-additional';
import { updateBorderedRectangleGraphics } from '../../functions';
import { type AnnotationCanvasStyle, type PixiApp } from '../../types';
import { type CanvasAppState } from '../canvas-state-type';

export const onPointerDownOnBackground = (
  state: CanvasAppState,
  canvasStyles: AnnotationCanvasStyle,
  mut_pixiApp: PixiApp
): void => {
  mut_pixiApp.temporaryRect.pixi.visible = true;
  updateBorderedRectangleGraphics(
    mut_pixiApp.temporaryRect.pixi,
    rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
    canvasStyles.temporaryRectFaceColor,
    canvasStyles.temporaryRectBorderWidthPx,
    canvasStyles.temporaryRectBorderColor
  );
};
