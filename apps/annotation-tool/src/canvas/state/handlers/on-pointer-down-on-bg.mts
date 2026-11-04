import { rectFrom2Points } from 'ts-utils-additional';
import { updateBorderedRectangleGraphics } from '../../functions/index.mjs';
import type {
  AnnotationCanvasStyle,
  PixiGlobalObjects,
} from '../../types/index.mjs';
import type { CanvasAppState } from '../canvas-state-type.mjs';

export const onPointerDownOnBackground = (
  state: CanvasAppState,
  canvasStyles: AnnotationCanvasStyle,
  mut_pixiGlobalObjects: PixiGlobalObjects,
): void => {
  mut_pixiGlobalObjects.temporaryRect.pixi.visible = true;

  updateBorderedRectangleGraphics(
    mut_pixiGlobalObjects.temporaryRect.pixi,
    rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
    canvasStyles.temporaryRectFaceColor,
    canvasStyles.temporaryRectBorderWidthPx,
    canvasStyles.temporaryRectBorderColor,
  );
};
