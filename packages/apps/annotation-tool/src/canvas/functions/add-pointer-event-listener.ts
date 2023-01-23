import { type Application, type Sprite } from 'pixi.js';
import { type CanvasAppState, type CanvasAppStateHandler } from '../state';

export const addGlobalPointerEventListener = (
  app: Application,
  mut_background: Sprite,
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
    const pointerPos = {
      x: Num.roundToInt(ev.offsetX),
      y: Num.roundToInt(ev.offsetY),
    };
    stateHandler(state, { type: 'pointerMove', pointerPos });
  };

  mut_background.interactive = true;
  mut_background.removeAllListeners();
  mut_background.addListener('pointerdown', pointerdownCallback);

  app.renderer.view.addEventListener('pointermove', pointermoveCallback);
  app.renderer.view.addEventListener('pointerup', pointerupCallback);

  return () => {
    mut_background.removeAllListeners();
    app.renderer.view.removeEventListener('pointermove', pointermoveCallback);
    app.renderer.view.removeEventListener('pointerup', pointerupCallback);
  };
};
