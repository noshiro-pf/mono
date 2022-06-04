import type { CanvasAppState } from './canvas-state-type';
import { defaultCanvasAppState } from './canvas-state-type';

export class StateManager {
  readonly #state: CanvasAppState = defaultCanvasAppState;

  get state(): CanvasAppState {
    return this.#state;
  }
}
