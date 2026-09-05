/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Point, type Rgba } from 'ts-utils-additional';
import {
  turnOffHighlight,
  turnOnHighlight,
  type Direction,
} from '../functions/index.mjs';
import {
  type AnnotationCanvasStyle,
  type IdType,
  type PixiApp,
  type PixiBbox,
} from '../types/index.mjs';
import { type CanvasAppState } from './canvas-state-type.mjs';
import {
  onPointerDown,
  onPointerDownOnBackground,
  onPointerMove,
  onPointerUpOnBackground,
} from './handlers/index.mjs';

export type CanvasAppAction = Readonly<
  | { type: 'backgroundPointerDown' }
  | { type: 'bboxFacePointerDown'; pixiBbox: PixiBbox }
  | { type: 'bboxFacePointerOut'; pixiBbox: PixiBbox }
  | { type: 'bboxFacePointerOver'; pixiBbox: PixiBbox }
  | { type: 'bboxPointPointerDown'; pixiBbox: PixiBbox; direction: Direction }
  | { type: 'cancel' }
  | { type: 'pointerMove'; pointerPos: Point }
  | { type: 'pointerUp' }
>;

export type CanvasAppStateHandler = (
  state: CanvasAppState,
  action: CanvasAppAction,
) => void;

export const canvasAppStateHandlerGenerator = (
  pixiApp: PixiApp,
  idMaker: () => IdType,
  canvasStyles: AnnotationCanvasStyle,
  newBboxColor: Readonly<{ border: Rgba; face: Rgba }>,
): CanvasAppStateHandler =>
  function canvasAppStateHandler(mut_state, action) {
    switch (action.type) {
      case 'pointerMove':
        onPointerMove(mut_state, action.pointerPos, pixiApp);

        break;

      case 'pointerUp':
        onPointerUpOnBackground(
          mut_state,
          idMaker,
          newBboxColor,
          canvasStyles,
          pixiApp,
          canvasAppStateHandler,
        );

        break;

      case 'backgroundPointerDown':
        mut_state.grabbingObject = { type: 'background' };

        onPointerDown(mut_state);

        onPointerDownOnBackground(mut_state, canvasStyles, pixiApp);

        break;

      case 'bboxFacePointerOver':
        if (mut_state.grabbingObject.type !== undefined) return;

        // highlight on
        turnOnHighlight(action.pixiBbox);

        break;
      case 'bboxFacePointerOut':
        // highlight off
        turnOffHighlight(action.pixiBbox);

        break;

      case 'bboxFacePointerDown':
        onPointerDown(mut_state);

        mut_state.grabbingObject = {
          type: 'bbox-face',
          pixiBbox: action.pixiBbox,
          rectPrevious: action.pixiBbox.rect,
        };

        break;

      case 'bboxPointPointerDown':
        onPointerDown(mut_state);

        mut_state.grabbingObject = {
          type: 'bbox-point',
          pixiBbox: action.pixiBbox,
          rectPrevious: action.pixiBbox.rect,
          direction: action.direction,
        };

        break;

      case 'cancel':
        break;
    }
  };
