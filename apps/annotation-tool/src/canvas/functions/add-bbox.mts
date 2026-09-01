/* transformer-ignore convert-to-readonly */
//
// PixiJS's scene graph is mutated in place, and so is the canvas's drag state.
// `convert-to-readonly` rewrites these types and every assignment through
// them, which this layer depends on. The `mut_` prefix marks the deliberate
// mutation, as it does elsewhere in the repository.

import { type Application } from 'pixi.js-legacy';
import { Num } from 'ts-data-forge';
import { type Rect, type Rgba } from 'ts-utils-additional';
import {
  type CanvasAppState,
  type CanvasAppStateHandler,
} from '../state/index.mjs';
import {
  type AnnotationCanvasStyle,
  type IdType,
  type PixiBbox,
} from '../types/index.mjs';
import { addBboxEventListener } from './add-bbox-event-listener.mjs';
import { foreachBboxPoints } from './bbox-points.mjs';
import { createBbox } from './create-pixi-bbox.mjs';

export const addBboxToCanvas = (
  mut_state: CanvasAppState,
  idMaker: () => IdType,
  bboxRect: Rect,
  bboxColor: Readonly<{ border: Rgba; face: Rgba }>,
  canvasStyles: AnnotationCanvasStyle,
  app: Application,
  stateHandler: CanvasAppStateHandler,
): void => {
  const [pixiBboxRect, pixiBboxPoints] = createBbox(
    bboxRect,
    canvasStyles.bbox.borderWidthPx.notSelected,
    canvasStyles.bbox.pointWidthPx,
    bboxColor.border,
  );

  const pixiBbox: PixiBbox = {
    id: idMaker(),
    rect: bboxRect,
    style: {
      borderColor: bboxColor.border,
      borderWidthPx: canvasStyles.bbox.borderWidthPx.notSelected,
      faceHighlightColor: bboxColor.face,
      pointWidthPxHalf: Num.roundToInt(canvasStyles.bbox.pointWidthPx / 2),
    },
    pixi: {
      face: pixiBboxRect,
      points: pixiBboxPoints,
    },
  } as const;

  addBboxEventListener(pixiBbox, mut_state, stateHandler);

  app.stage.addChild(pixiBboxRect);

  foreachBboxPoints(pixiBboxPoints, (_, p) => app.stage.addChild(p));

  mut_state.bboxList.push(pixiBbox);
};
