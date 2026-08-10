import { type Rect } from '@noshiro/ts-utils-additional';

export type CallbackFnsType = Readonly<{
  addBbox: (rect: Rect) => void;
  updateTempRect: (rect: Rect) => void;
}>;
