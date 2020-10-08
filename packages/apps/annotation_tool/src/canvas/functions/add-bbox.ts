import { Rect, Rgba, roundToInt } from '@mono/ts-utils';
import { Application } from 'pixi.js';
import { CanvasAppState } from '../state/canvas-state-type';
import { CanvasAppStateHandler } from '../state/state-handler-main';
import { AnnotationCanvasStyle } from '../types/annotation-canvas-style';
import { IdType } from '../types/id-type';
import { PixiBbox } from '../types/pixi-bbox';
import { addBboxEventListener } from './add-bbox-event-listener';
import { foreachBboxPoints } from './bbox-points';
import { createBbox } from './create-pixi-bbox';

export const addBboxToCanvas = (
  state: CanvasAppState,
  idMaker: () => IdType,
  bboxRect: Rect,
  bboxColor: { border: Rgba; face: Rgba },
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
