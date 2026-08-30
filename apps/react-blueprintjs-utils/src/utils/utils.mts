import { hexToRgb } from './ported.mjs';

export const hexToRgba = (
  hex: string,
  alpha: number,
): `rgba(${string}, ${number})` =>
  `rgba(${hexToRgb(hex).join(', ')}, ${alpha})` as const;

/** Join lines with `${lines.join(', \n')};` */
export const joinCssStr = (...lines: readonly string[]): string =>
  `${lines.join(', \n')};` as const;
