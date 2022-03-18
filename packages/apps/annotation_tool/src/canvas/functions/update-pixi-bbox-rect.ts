import type { Rect, Rgba } from '@noshiro/ts-utils';
import { rgbaToHexNumber } from '@noshiro/ts-utils';
import type { Graphics } from 'pixi.js';
import { Rectangle } from 'pixi.js';
import type { PixiBbox } from '../types';

export const updateBboxRect = (
  mut_graphics: Graphics,
  rect: Rect,
  borderWidthPx: number,
  borderColor: Rgba,
  faceColor: Rgba | undefined
): void => {
  mut_graphics.clear();

  if (faceColor !== undefined) {
    const { hex, alpha } = rgbaToHexNumber(faceColor);
    mut_graphics.beginFill(hex, alpha);
  }
  {
    const { hex, alpha } = rgbaToHexNumber(borderColor);
    mut_graphics.lineStyle(borderWidthPx, hex, alpha, 0.5);
    const { left, top: top_, width, height } = rect;
    mut_graphics.drawRect(left, top_, width, height);
    mut_graphics.hitArea = new Rectangle(left, top_, width, height);
  }

  mut_graphics.endFill();
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
