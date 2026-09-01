/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import {
  type CanvasAppState,
  type CanvasAppStateHandler,
} from '../state/index.mjs';
import { type PixiBbox } from '../types/index.mjs';
import { foreachBboxPoints } from './bbox-points.mjs';

export const addBboxEventListener = (
  pixiBbox: PixiBbox,
  state: CanvasAppState,
  stateHandler: CanvasAppStateHandler,
): void => {
  pixiBbox.pixi.face.removeAllListeners();

  pixiBbox.pixi.face.addListener('pointerover', () => {
    // highlight on
    stateHandler(state, { type: 'bboxFacePointerOver', pixiBbox });
  });

  pixiBbox.pixi.face.addListener('pointerout', () => {
    // highlight off
    stateHandler(state, { type: 'bboxFacePointerOut', pixiBbox });
  });

  pixiBbox.pixi.face.addListener('pointerdown', () => {
    stateHandler(state, { type: 'bboxFacePointerDown', pixiBbox });
  });

  foreachBboxPoints(pixiBbox.pixi.points, (direction, p) => {
    p.removeAllListeners();

    p.addListener('pointerdown', () => {
      stateHandler(state, {
        type: 'bboxPointPointerDown',
        pixiBbox,
        direction,
      });
    });
  });
};
