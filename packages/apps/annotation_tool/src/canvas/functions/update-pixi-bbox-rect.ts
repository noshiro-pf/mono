import { Rect, Rgba, rgbaToHexNumber } from '@mono/ts-utils';
import { Graphics, Rectangle } from 'pixi.js';
import { PixiBbox } from '../types/pixi-bbox';

export const updateBboxRect = (
  graphics: Graphics,
  rect: Rect,
  borderWidthPx: number,
  borderColor: Rgba,
  faceColor: Rgba | undefined
): void => {
  graphics.clear();

  if (faceColor !== undefined) {
    const { hex, alpha } = rgbaToHexNumber(faceColor);
    graphics.beginFill(hex, alpha);
  }
  {
    const { hex, alpha } = rgbaToHexNumber(borderColor);
    graphics.lineStyle(borderWidthPx, hex, alpha, 0.5);
    const { left, top, width, height } = rect;
    graphics.drawRect(left, top, width, height);
    graphics.hitArea = new Rectangle(left, top, width, height);
  }

  graphics.endFill();
};

export const turnOnHighlight = (pixiBbox: PixiBbox): void => {
  updateBboxRect(
    pixiBbox.pixi.face,
    pixiBbox.rect,
    pixiBbox.style.borderWidthPx,
    pixiBbox.style.borderColor,
    pixiBbox.style.faceHighlightColor
  );
};

export const turnOffHighlight = (pixiBbox: PixiBbox): void => {
  updateBboxRect(
    pixiBbox.pixi.face,
    pixiBbox.rect,
    pixiBbox.style.borderWidthPx,
    pixiBbox.style.borderColor,
    undefined
  );
};

export const updateRectOfBbox = (pixiBbox: PixiBbox, rectAfter: Rect): void => {
  updateBboxRect(
    pixiBbox.pixi.face,
    rectAfter,
    pixiBbox.style.borderWidthPx,
    pixiBbox.style.borderColor,
    pixiBbox.style.faceHighlightColor
  );
};
