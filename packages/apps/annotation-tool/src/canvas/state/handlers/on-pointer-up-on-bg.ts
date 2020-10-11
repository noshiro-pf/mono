import type { Rgba } from '@noshiro/ts-utils-additional';
import { rectFrom2Points } from '@noshiro/ts-utils-additional';
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
  mut_state: CanvasAppState,
  idMaker: () => IdType,
  newBboxColor: Readonly<{ border: Rgba; face: Rgba }>,
  canvasStyles: AnnotationCanvasStyle,
  mut_app: Application,
  mut_pixiGlobalObjects: PixiGlobalObjects,
  stateHandler: CanvasAppStateHandler
): void => {
  if (mut_state.grabbingObject.type === 'background') {
    addBboxToCanvas(
      mut_state,
      idMaker,
      rectFrom2Points(mut_state.dragStartPoint, mut_state.dragEndPoint),
      newBboxColor,
      canvasStyles,
      mut_app,
      stateHandler
    );
  }
  mut_state.grabbingObject = { type: undefined };
  mut_pixiGlobalObjects.temporaryRect.pixi.visible = false;
};
