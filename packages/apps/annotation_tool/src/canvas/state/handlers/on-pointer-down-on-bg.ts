import { rectFrom2Points } from '@noshiro/ts-utils';
import { updateBorderedRectangleGraphics } from '../../functions/create-pixi-object';
import { AnnotationCanvasStyle } from '../../types/annotation-canvas-style';
import { PixiApp } from '../../types/pixi-app-type';
import { CanvasAppState } from '../canvas-state-type';

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
