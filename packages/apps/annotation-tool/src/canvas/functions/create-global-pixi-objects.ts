import { type RectSize } from '@noshiro/ts-utils-additional';
import { type Application, type Sprite } from 'pixi.js-legacy';
import { type AnnotationCanvasStyle, type PixiTempRect } from '../types';
import {
  createBorderedRectangleGraphics,
  createDummySpriteRectangle,
  createRectangleSprite,
} from './create-pixi-object';

type Args = Readonly<{
  app: Application;
  canvasSize: RectSize;
  canvasStyles: AnnotationCanvasStyle;
}>;

type ComponentReturnType = Readonly<{
  background: Sprite;
  verticalLine: Sprite;
  horizontalLine: Sprite;
  temporaryRect: PixiTempRect;
}>;

export const createGlobalPixiObjects = ({
  app,
  canvasSize,
  canvasStyles,
}: Args): ComponentReturnType => {
  const halfWidth: number = Math.floor(canvasStyles.crosshairLineWidthPx / 2);

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
    canvasStyles.crosshairLineColor,
  );

  const horizontalLine = createRectangleSprite(
    {
      left: 0,
      top: -halfWidth,
      width: canvasSize.width,
      height: canvasStyles.crosshairLineWidthPx,
    },
    canvasStyles.crosshairLineColor,
  );

  const mut_temporaryRect: PixiTempRect = {
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
      canvasStyles.temporaryRectBorderColor,
    ),
  };

  mut_temporaryRect.pixi.visible = false;

  app.stage.addChild(
    background,
    verticalLine,
    horizontalLine,
    mut_temporaryRect.pixi,
  );

  return {
    background,
    verticalLine,
    horizontalLine,
    temporaryRect: mut_temporaryRect,
  };
};
