import type { CanvasAppState } from '../state/canvas-state-type';
import type { CanvasAppStateHandler } from '../state/state-handler-main';
import type { PixiBbox } from '../types/pixi-bbox';
import { foreachBboxPoints } from './bbox-points';

export const addBboxEventListener = (
  pixiBbox: PixiBbox,
  state: CanvasAppState,
  stateHandler: CanvasAppStateHandler
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
