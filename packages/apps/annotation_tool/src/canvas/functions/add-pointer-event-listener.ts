import { roundToInt } from '@noshiro/ts-utils';
import type { Application, Sprite } from 'pixi.js';
import type { CanvasAppState, CanvasAppStateHandler } from '../state';

export const addGlobalPointerEventListener = (
  pixiApp: Application,
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

  pixiApp.renderer.view.addEventListener('pointermove', pointermoveCallback);
  pixiApp.renderer.view.addEventListener('pointerup', pointerupCallback);

  return () => {
    background.removeAllListeners();
    pixiApp.renderer.view.removeEventListener(
      'pointermove',
      pointermoveCallback
    );
    pixiApp.renderer.view.removeEventListener('pointerup', pointerupCallback);
  };
};
