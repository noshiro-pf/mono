import { Rect } from '@mono/ts-utils';

export type CallbackFnsType = {
  addBbox: (rect: Rect) => void;
  updateTempRect: (rect: Rect) => void;
};
