import { CanvasAppState } from '../canvas-state-type';

export const onPointerDown = (state: CanvasAppState): void => {
  state.dragStartPoint = state.pointerPos;
  state.dragEndPoint = state.pointerPos;
};
