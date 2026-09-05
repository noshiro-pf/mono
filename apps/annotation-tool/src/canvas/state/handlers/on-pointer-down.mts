/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type CanvasAppState } from '../canvas-state-type.mjs';

export const onPointerDown = (mut_state: CanvasAppState): void => {
  mut_state.dragStartPoint = mut_state.pointerPos;

  mut_state.dragEndPoint = mut_state.pointerPos;
};
