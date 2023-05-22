import { hexToRgb } from '@noshiro/ts-utils-additional';

export const hexToRgba = (
  hex: string,
  alpha: number
): `rgba(${string}, ${number})` =>
  `rgba(${hexToRgb(hex).join(', ')}, ${alpha})`;

/**
 * @description join lines with `${lines.join(', \n')};`
 */
export const joinCssStr = (...lines: readonly string[]): string =>
  `${lines.join(', \n')};`;
