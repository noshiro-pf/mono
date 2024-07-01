import {
  rgbaToHexNumber,
  type Rect,
  type Rgba,
} from '@noshiro/ts-utils-additional';
import { Graphics, Sprite, Texture } from 'pixi.js-legacy';

export const createDummySpriteRectangle = (rect: Rect): Sprite => {
  const mut_rectObj = new Sprite(Texture.EMPTY);
  mut_rectObj.roundPixels = true;
  mut_rectObj.position.set(rect.left, rect.top);
  mut_rectObj.width = rect.width;
  mut_rectObj.height = rect.height;
  return mut_rectObj;
};

export const createRectangleSprite = (rect: Rect, faceColor: Rgba): Sprite => {
  const mut_rectObj = new Sprite(Texture.WHITE);
  mut_rectObj.roundPixels = true;
  mut_rectObj.position.set(rect.left, rect.top);
  mut_rectObj.width = rect.width;
  mut_rectObj.height = rect.height;
  {
    const { hex, alpha } = rgbaToHexNumber(faceColor);
    mut_rectObj.tint = hex;
    mut_rectObj.alpha = alpha;
  }
  return mut_rectObj;
};

export const getSpriteRect = (sprite: Sprite): Rect => ({
  left: sprite.x,
  top: sprite.y,
  width: sprite.width,
  height: sprite.height,
});

export const createRectangleGraphics = (
  rect: Rect,
  faceColor: Rgba,
): Graphics => {
  const gr = new Graphics();
  updateRectangleGraphics(gr, rect, faceColor);
  return gr;
};

export const updateRectangleGraphics = (
  gr: Graphics,
  rect: Rect,
  faceColor: Rgba,
): void => {
  gr.clear();
  const { left, top: top_, width, height } = rect;
  const { hex, alpha } = rgbaToHexNumber(faceColor);
  gr.beginFill(hex, alpha);
  gr.drawRect(left, top_, width, height);
  gr.endFill();
};

export const createBorderedRectangleGraphics = (
  rect: Rect,
  faceColor: Rgba,
  borderWidthPx: number,
  borderColor: Rgba,
): Graphics => {
  const gr = new Graphics();
  updateBorderedRectangleGraphics(
    gr,
    rect,
    faceColor,
    borderWidthPx,
    borderColor,
  );
  return gr;
};

export const updateBorderedRectangleGraphics = (
  gr: Graphics,
  rect: Rect,
  faceColor: Rgba,
  borderWidthPx: number,
  borderColor: Rgba,
): void => {
  gr.clear();
  {
    const { hex, alpha } = rgbaToHexNumber(borderColor);
    gr.lineStyle(borderWidthPx, hex, alpha, 0);
  }
  {
    const { left, top: top_, width, height } = rect;
    const { hex, alpha } = rgbaToHexNumber(faceColor);
    gr.beginFill(hex, alpha);
    gr.drawRect(left, top_, width, height);
    gr.endFill();
  }
};
