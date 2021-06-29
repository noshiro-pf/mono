import type { TypeExtends } from '@noshiro/ts-utils';
import { assertType } from '@noshiro/ts-utils';

export type CustomColor = '#383838' | 'red' | 'rgb(48, 255, 135)';

export const outlineColorDef = {
  green: 'rgb(48, 255, 135)',
  red: 'red',
} as const;

assertType<TypeExtends<typeof outlineColorDef, Record<string, CustomColor>>>();

export type CardTextColor = DarkGray | LightGray | 'black' | 'white';
type DarkGray = 'rgb(60, 60, 60)';
type LightGray = 'rgb(240, 240, 240)';
export const darkGray: DarkGray = 'rgb(60, 60, 60)';
export const lightGray: LightGray = 'rgb(240, 240, 240)';

export const inTurnColor = 'rgb(80, 158, 188)';

export const eyeIconColorDef = {
  light: '#ABABAB',
  dark: '#4B4B4B',
} as const;

export const balloonColor: string = 'hsl(0, 0%, 30%)';
