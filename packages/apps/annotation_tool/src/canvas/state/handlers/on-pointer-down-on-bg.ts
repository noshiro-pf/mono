import { rectFrom2Points } from '@noshiro/ts-utils';
import { updateBorderedRectangleGraphics } from '../../functions/create-pixi-object';
import type { AnnotationCanvasStyle } from '../../types/annotation-canvas-style';
import type { PixiApp } from '../../types/pixi-app-type';
import type { CanvasAppState } from '../canvas-state-type';

export const onPointerDownOnBackground = (
  state: CanvasAppState,
  canvasStyles: AnnotationCanvasStyle,
  pixiApp: PixiApp
): void => {
  pixiApp.temporaryRect.pixi.visible = true;
  updateBorderedRectangleGraphics(
    pixiApp.temporaryRect.pixi,
    rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
    canvasStyles.temporaryRectFaceColor,
    canvasStyles.temporaryRectBorderWidthPx,
    canvasStyles.temporaryRectBorderColor
  );
};
