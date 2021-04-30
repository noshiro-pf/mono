import { rectFrom2Points, Rgba } from '@noshiro/ts-utils';
import { addBboxToCanvas } from '../../functions/add-bbox';
import { AnnotationCanvasStyle } from '../../types/annotation-canvas-style';
import { IdType } from '../../types/id-type';
import { PixiApp } from '../../types/pixi-app-type';
import { CanvasAppState } from '../canvas-state-type';
import { CanvasAppStateHandler } from '../state-handler-main';

export const onPointerUpOnBackground = (
  state: CanvasAppState,
  idMaker: () => IdType,
  newBboxColor: Readonly<{ border: Rgba; face: Rgba }>,
  canvasStyles: AnnotationCanvasStyle,
  pixiApp: PixiApp,
  stateHandler: CanvasAppStateHandler
): void => {
  if (state.grabbingObject.type === 'background') {
    addBboxToCanvas(
      state,
      idMaker,
      rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
      newBboxColor,
      canvasStyles,
      pixiApp.app,
      stateHandler
    );
  }
  state.grabbingObject = { type: undefined };
  pixiApp.temporaryRect.pixi.visible = false;
};
