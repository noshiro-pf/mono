import { rectFrom2Points } from 'ts-utils-additional';
import { updateBorderedRectangleGraphics } from '../../functions/index.mjs';
import {
  type AnnotationCanvasStyle,
  type PixiApp,
} from '../../types/index.mjs';
import { type CanvasAppState } from '../canvas-state-type.mjs';

export const onPointerDownOnBackground = (
  state: CanvasAppState,
  canvasStyles: AnnotationCanvasStyle,
  mut_pixiApp: PixiApp,
): void => {
  mut_pixiApp.temporaryRect.pixi.visible = true;

  updateBorderedRectangleGraphics(
    mut_pixiApp.temporaryRect.pixi,
    rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
    canvasStyles.temporaryRectFaceColor,
    canvasStyles.temporaryRectBorderWidthPx,
    canvasStyles.temporaryRectBorderColor,
  );
};
