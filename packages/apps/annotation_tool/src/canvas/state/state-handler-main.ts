import { Point, Rgba } from '@noshiro/ts-utils';
import { Direction } from '../functions/bbox-points';
import {
  turnOffHighlight,
  turnOnHighlight,
} from '../functions/update-pixi-bbox-rect';
import { AnnotationCanvasStyle } from '../types/annotation-canvas-style';
import { IdType } from '../types/id-type';
import { PixiApp } from '../types/pixi-app-type';
import { PixiBbox } from '../types/pixi-bbox';
import { CanvasAppState } from './canvas-state-type';
import { onPointerDown } from './handlers/on-pointer-down';
import { onPointerDownOnBackground } from './handlers/on-pointer-down-on-bg';
import { onPointerMove } from './handlers/on-pointer-move';
import { onPointerUpOnBackground } from './handlers/on-pointer-up-on-bg';

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
  action: CanvasAppAction
) => void;

export const canvasAppStateHandlerGenerator = (
  pixiApp: PixiApp,
  idMaker: () => IdType,
  canvasStyles: AnnotationCanvasStyle,
  newBboxColor: { border: Rgba; face: Rgba }
): CanvasAppStateHandler =>
  function canvasAppStateHandler(state, action) {
    switch (action.type) {
      case 'pointerMove':
        onPointerMove(state, action.pointerPos, pixiApp);
        break;

      case 'pointerUp':
        onPointerUpOnBackground(
          state,
          idMaker,
          newBboxColor,
          canvasStyles,
          pixiApp,
          canvasAppStateHandler
        );
        break;

      case 'backgroundPointerDown':
        state.grabbingObject = { type: 'background' };
        onPointerDown(state);
        onPointerDownOnBackground(state, canvasStyles, pixiApp);
        break;

      case 'bboxFacePointerOver':
        if (state.grabbingObject.type !== undefined) return;
        // highlight on
        turnOnHighlight(action.pixiBbox);
        break;
      case 'bboxFacePointerOut':
        // highlight off
        turnOffHighlight(action.pixiBbox);
        break;

      case 'bboxFacePointerDown':
        onPointerDown(state);
        state.grabbingObject = {
          type: 'bbox-face',
          pixiBbox: action.pixiBbox,
          rectPrevious: action.pixiBbox.rect,
        };
        break;

      case 'bboxPointPointerDown':
        onPointerDown(state);
        state.grabbingObject = {
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
