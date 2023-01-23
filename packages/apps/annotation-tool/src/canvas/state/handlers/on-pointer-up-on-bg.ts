import { rectFrom2Points, type Rgba } from '@noshiro/ts-utils-additional';
import { addBboxToCanvas } from '../../functions';
import {
  type AnnotationCanvasStyle,
  type IdType,
  type PixiApp,
} from '../../types';
import { type CanvasAppState } from '../canvas-state-type';
import { type CanvasAppStateHandler } from '../state-handler-main';

export const onPointerUpOnBackground = (
  mut_state: CanvasAppState,
  idMaker: () => IdType,
  newBboxColor: Readonly<{ border: Rgba; face: Rgba }>,
  canvasStyles: AnnotationCanvasStyle,
  mut_pixiApp: PixiApp,
  stateHandler: CanvasAppStateHandler
): void => {
  if (mut_state.grabbingObject.type === 'background') {
    addBboxToCanvas(
      mut_state,
      idMaker,
      rectFrom2Points(mut_state.dragStartPoint, mut_state.dragEndPoint),
      newBboxColor,
      canvasStyles,
      mut_pixiApp.app,
      stateHandler
    );
  }
  mut_state.grabbingObject = { type: undefined };
  mut_pixiApp.temporaryRect.pixi.visible = false;
};
