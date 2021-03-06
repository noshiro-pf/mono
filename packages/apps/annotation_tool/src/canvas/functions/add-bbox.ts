import type { Rect, Rgba } from '@noshiro/ts-utils';
import { roundToInt } from '@noshiro/ts-utils';
import type { Application } from 'pixi.js';
import type { CanvasAppState, CanvasAppStateHandler } from '../state';
import type { AnnotationCanvasStyle, IdType, PixiBbox } from '../types';
import { addBboxEventListener } from './add-bbox-event-listener';
import { foreachBboxPoints } from './bbox-points';
import { createBbox } from './create-pixi-bbox';

export const addBboxToCanvas = (
  state: CanvasAppState,
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
      pointWidthPxHalf: roundToInt(canvasStyles.bbox.pointWidthPx / 2),
    },
    pixi: {
      face: pixiBboxRect,
      points: pixiBboxPoints,
    },
  };

  addBboxEventListener(pixiBbox, state, stateHandler);

  app.stage.addChild(pixiBboxRect);
  foreachBboxPoints(pixiBboxPoints, (_, p) => app.stage.addChild(p));

  state.bboxList.push(pixiBbox);
};
