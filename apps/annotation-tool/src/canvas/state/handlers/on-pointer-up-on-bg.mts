/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { rectFrom2Points, type Rgba } from 'ts-utils-additional';
import { addBboxToCanvas } from '../../functions/index.mjs';
import {
  type AnnotationCanvasStyle,
  type IdType,
  type PixiApp,
} from '../../types/index.mjs';
import { type CanvasAppState } from '../canvas-state-type.mjs';
import { type CanvasAppStateHandler } from '../state-handler-main.mjs';

export const onPointerUpOnBackground = (
  mut_state: CanvasAppState,
  idMaker: () => IdType,
  newBboxColor: Readonly<{ border: Rgba; face: Rgba }>,
  canvasStyles: AnnotationCanvasStyle,
  mut_pixiApp: PixiApp,
  stateHandler: CanvasAppStateHandler,
): void => {
  if (mut_state.grabbingObject.type === 'background') {
    addBboxToCanvas(
      mut_state,
      idMaker,
      rectFrom2Points(mut_state.dragStartPoint, mut_state.dragEndPoint),
      newBboxColor,
      canvasStyles,
      mut_pixiApp.app,
      stateHandler,
    );
  }

  mut_state.grabbingObject = { type: undefined };

  mut_pixiApp.temporaryRect.pixi.visible = false;
};
