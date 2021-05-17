import { roundToInt } from '@noshiro/ts-utils';
import type { Application, Sprite } from 'pixi.js';
import type { CanvasAppState } from '../state/canvas-state-type';
import type { CanvasAppStateHandler } from '../state/state-handler-main';

export const addGlobalPointerEventListener = (
  app: Application,
  background: Sprite,
  state: CanvasAppState,
  stateHandler: CanvasAppStateHandler
): (() => void) => {
  const pointerdownCallback = (): void => {
    stateHandler(state, { type: 'backgroundPointerDown' });
  };

  const pointerupCallback = (): void => {
    stateHandler(state, { type: 'pointerUp' });
  };

  const pointermoveCallback = (ev: Readonly<PointerEvent>): void => {
    const pointerPos = { x: roundToInt(ev.offsetX), y: roundToInt(ev.offsetY) };
    stateHandler(state, { type: 'pointerMove', pointerPos });
  };

  background.interactive = true;
  background.removeAllListeners();
  background.addListener('pointerdown', pointerdownCallback);

  app.renderer.view.addEventListener('pointermove', pointermoveCallback);
  app.renderer.view.addEventListener('pointerup', pointerupCallback);

  return () => {
    background.removeAllListeners();
    app.renderer.view.removeEventListener('pointermove', pointermoveCallback);
    app.renderer.view.removeEventListener('pointerup', pointerupCallback);
  };
};
