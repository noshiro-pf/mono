import { RectSize } from '@noshiro/ts-utils';
import { Application, Sprite } from 'pixi.js';
import { AnnotationCanvasStyle } from '../types/annotation-canvas-style';
import { PixiTempRect } from '../types/pixi-temp-rect';
import {
  createBorderedRectangleGraphics,
  createDummySpriteRectangle,
  createRectangleSprite,
} from './create-pixi-object';

interface Args {
  app: Application;
  canvasSize: RectSize;
  canvasStyles: AnnotationCanvasStyle;
}

interface ReturnType {
  background: Sprite;
  verticalLine: Sprite;
  horizontalLine: Sprite;
  temporaryRect: PixiTempRect;
}

export const createGlobalPixiObjects = ({
  app,
  canvasSize,
  canvasStyles,
}: Args): ReturnType => {
  const halfWidth = Math.floor(canvasStyles.crosshairLineWidthPx / 2);

  const background = createDummySpriteRectangle({
    top: 0,
    left: 0,
    ...canvasSize,
  });

  const verticalLine = createRectangleSprite(
    {
      left: -halfWidth,
      top: 0,
      width: canvasStyles.crosshairLineWidthPx,
      height: canvasSize.height,
    },
    canvasStyles.crosshairLineColor
  );

  const horizontalLine = createRectangleSprite(
    {
      left: 0,
      top: -halfWidth,
      width: canvasSize.width,
      height: canvasStyles.crosshairLineWidthPx,
    },
    canvasStyles.crosshairLineColor
  );

  const temporaryRect: PixiTempRect = {
    rect: { left: 0, top: 0, width: 1, height: 1 },
    style: {
      borderWidthPx: canvasStyles.temporaryRectBorderWidthPx,
      borderColor: canvasStyles.temporaryRectBorderColor,
      faceColor: canvasStyles.temporaryRectFaceColor,
    },
    pixi: createBorderedRectangleGraphics(
      { left: 0, top: 0, width: 1, height: 1 },
      canvasStyles.temporaryRectFaceColor,
      canvasStyles.temporaryRectBorderWidthPx,
      canvasStyles.temporaryRectBorderColor
    ),
  };

  temporaryRect.pixi.visible = false;

  app.stage.addChild(
    background,
    verticalLine,
    horizontalLine,
    temporaryRect.pixi
  );

  return { background, verticalLine, horizontalLine, temporaryRect };
};
