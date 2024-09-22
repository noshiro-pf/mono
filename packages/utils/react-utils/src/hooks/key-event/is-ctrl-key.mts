import { getPlatform } from '@noshiro/ts-utils-additional';
import { type KeyboardEventType } from './key-event-type.mjs';

export const isCtrlKey = <T = Element,>(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  keyEvent: KeyboardEventType<T>,
): boolean => {
  const os = getPlatform();
  switch (os) {
    case 'mac':
      return keyEvent.metaKey;
    case 'windows':
      return keyEvent.ctrlKey;
    case 'other':
      return keyEvent.ctrlKey;
  }
};
