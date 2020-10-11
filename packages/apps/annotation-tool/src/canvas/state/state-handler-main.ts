import type { Point, Rgba } from '@noshiro/ts-utils-additional';
import type { Application } from 'pixi.js';
import type { Direction } from '../functions';
import { turnOffHighlight, turnOnHighlight } from '../functions';
import type {
  AnnotationCanvasStyle,
  IdType,
  PixiBbox,
  PixiGlobalObjects,
} from '../types';
import type { CanvasAppState } from './canvas-state-type';
import {
  onPointerDown,
  onPointerDownOnBackground,
  onPointerMove,
  onPointerUpOnBackground,
} from './handlers';

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
  pixiApp: Application,
  pixiGlobalObjects: PixiGlobalObjects,
  idMaker: () => IdType,
  canvasStyles: AnnotationCanvasStyle,
  newBboxColor: Readonly<{ border: Rgba; face: Rgba }>
): CanvasAppStateHandler =>
  function canvasAppStateHandler(mut_state, action) {
    switch (action.type) {
      case 'pointerMove':
        onPointerMove(mut_state, action.pointerPos, pixiGlobalObjects);
        break;

      case 'pointerUp':
        onPointerUpOnBackground(
          mut_state,
          idMaker,
          newBboxColor,
          canvasStyles,
          pixiApp,
          pixiGlobalObjects,
          canvasAppStateHandler
        );
        break;

      case 'backgroundPointerDown':
        mut_state.grabbingObject = { type: 'background' };
        onPointerDown(mut_state);
        onPointerDownOnBackground(mut_state, canvasStyles, pixiGlobalObjects);
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
