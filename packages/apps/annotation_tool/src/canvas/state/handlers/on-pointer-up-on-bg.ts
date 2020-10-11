import type { Rgba } from '@noshiro/ts-utils';
import { rectFrom2Points } from '@noshiro/ts-utils';
import type { Application } from 'pixi.js';
import { addBboxToCanvas } from '../../functions';
import type {
  AnnotationCanvasStyle,
  IdType,
  PixiGlobalObjects,
} from '../../types';
import type { CanvasAppState } from '../canvas-state-type';
import type { CanvasAppStateHandler } from '../state-handler-main';

export const onPointerUpOnBackground = (
  state: CanvasAppState,
  idMaker: () => IdType,
  newBboxColor: Readonly<{ border: Rgba; face: Rgba }>,
  canvasStyles: AnnotationCanvasStyle,
  app: Application,
  pixiGlobalObjects: PixiGlobalObjects,
  stateHandler: CanvasAppStateHandler
): void => {
  if (state.grabbingObject.type === 'background') {
    addBboxToCanvas(
      state,
      idMaker,
      rectFrom2Points(state.dragStartPoint, state.dragEndPoint),
      newBboxColor,
      canvasStyles,
      app,
      stateHandler
    );
  }
  state.grabbingObject = { type: undefined };
  pixiGlobalObjects.temporaryRect.pixi.visible = false;
};
