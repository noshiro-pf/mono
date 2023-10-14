import { hexToRgba } from '../utils';
import {
  ptHeadingColor,
  ptIntentDanger,
  ptIntentPrimary,
  ptIntentSuccess,
  ptIntentWarning,
  ptOutlineColor,
} from './color-aliases';
import {
  black,
  blue2,
  blue5,
  green2,
  green5,
  orange2,
  orange5,
  red2,
  red5,
} from './colors';
import { ptFontSizePx, ptLineHeightPx } from './variables';

export type IntentKey = 'danger' | 'primary' | 'success' | 'warning';

export const ptIntentColors = {
  primary: ptIntentPrimary,
  success: ptIntentSuccess,
  warning: ptIntentWarning,
  danger: ptIntentDanger,
} as const;

export const ptIntentTextColors = {
  primary: blue2,
  success: green2,
  warning: orange2,
  danger: red2,
} as const;

export const ptDarkIntentTextColors = {
  primary: blue5,
  success: green5,
  warning: orange5,
  danger: red5,
} as const;

export const intentColor = (intentName: IntentKey): string =>
  `color: ${ptIntentColors[intentName]});`;

export const positionAll = (position: string, value: string) =>
  ({
    bottom: value,
    left: value,
    position,
    right: value,
    top: value,
  }) as const;

export const baseTypography = [
  `font-size: ${ptFontSizePx}px;`,
  `font-weight: 400;`,
  `letter-spacing: 0;`,
  `line-height: ${ptLineHeightPx}px;`,
  `text-transform: none;`,
].join('\n');

export const runningTypography = [
  `font-size: ${ptFontSizePx}px;`,
  'line-height: 1.5;',
].join('\n');

export const headingTypography = [
  `color: ${ptHeadingColor};`,
  'font-weight: 600;',
].join('\n');

export const monospaceTypography = [
  'font-family: monospace;',
  'text-transform: none;',
].join('\n');

export const overflowEllipsis = [
  'overflow: hidden;',
  'text-overflow: ellipsis;',
  'white-space: nowrap;',
  'word-wrap: normal;',
].join('\n');

export const focusOutline = (offsetPx: number = 2): string =>
  [
    `outline: ${ptOutlineColor} auto 2px;`,
    `outline-offset: ${offsetPx}px;`,
    '-moz-outline-radius: 6px;',
  ].join('\n');

export const borderShadow = (
  alpha: number,
  colorHex: string = black,
  sizePx = 1
): string => `0 0 0 ${sizePx}px ${hexToRgba(colorHex, alpha)}`;

// returns the padding necessary to center text in a container of the given height.
// default line-height is that of base typography, 18px assuming 14px font-size.

export const centeredTextPaddingPx = (
  height: number,
  lineHeight: number = Math.floor(ptFontSizePx * ptLineHeightPx)
): number => Math.floor((height - lineHeight) / 2);

// Isolates z-indices

export const newRenderLayer = 'transform: translateZ(0)';
