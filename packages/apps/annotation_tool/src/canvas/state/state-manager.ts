import { CanvasAppState, defaultCanvasAppState } from './canvas-state-type';

export class StateManager {
  private _state: CanvasAppState = defaultCanvasAppState;

  get state(): CanvasAppState {
    return this._state;
  }
}
