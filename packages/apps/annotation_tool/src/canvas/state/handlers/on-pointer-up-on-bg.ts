import type { Rgba } from '@noshiro/ts-utils';
import { rectFrom2Points } from '@noshiro/ts-utils';
import { addBboxToCanvas } from '../../functions';
import type { AnnotationCanvasStyle, IdType, PixiApp } from '../../types';
import type { CanvasAppState } from '../canvas-state-type';
import type { CanvasAppStateHandler } from '../state-handler-main';

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
