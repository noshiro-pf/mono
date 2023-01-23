import {
  defaultCanvasAppState,
  type CanvasAppState,
} from './canvas-state-type';

export class StateManager {
  readonly #state: CanvasAppState = defaultCanvasAppState;

  get state(): CanvasAppState {
    return this.#state;
  }
}
