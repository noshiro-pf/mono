import { type Rect, type Rgba } from '@noshiro/ts-utils-additional';
import { type Application } from 'pixi.js';
import { type CanvasAppState, type CanvasAppStateHandler } from '../state';
import {
  type AnnotationCanvasStyle,
  type IdType,
  type PixiBbox,
} from '../types';
import { addBboxEventListener } from './add-bbox-event-listener';
import { foreachBboxPoints } from './bbox-points';
import { createBbox } from './create-pixi-bbox';

export const addBboxToCanvas = (
  mut_state: CanvasAppState,
  idMaker: () => IdType,
  bboxRect: Rect,
  bboxColor: Readonly<{ border: Rgba; face: Rgba }>,
  canvasStyles: AnnotationCanvasStyle,
  app: Application,
  stateHandler: CanvasAppStateHandler
): void => {
  const [pixiBboxRect, pixiBboxPoints] = createBbox(
    bboxRect,
    canvasStyles.bbox.borderWidthPx.notSelected,
    canvasStyles.bbox.pointWidthPx,
    bboxColor.border
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
  };

  addBboxEventListener(pixiBbox, mut_state, stateHandler);

  app.stage.addChild(pixiBboxRect);
  foreachBboxPoints(pixiBboxPoints, (_, p) => app.stage.addChild(p));

  mut_state.bboxList.push(pixiBbox);
};
