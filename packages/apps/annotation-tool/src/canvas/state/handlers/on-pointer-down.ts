import { type CanvasAppState } from '../canvas-state-type';

export const onPointerDown = (mut_state: CanvasAppState): void => {
  mut_state.dragStartPoint = mut_state.pointerPos;
  mut_state.dragEndPoint = mut_state.pointerPos;
};
