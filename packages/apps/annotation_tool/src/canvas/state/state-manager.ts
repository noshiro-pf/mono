import type { CanvasAppState } from './canvas-state-type';
import { defaultCanvasAppState } from './canvas-state-type';

export class StateManager {
  private readonly _state: CanvasAppState = defaultCanvasAppState;

  get state(): CanvasAppState {
    return this._state;
  }
}
