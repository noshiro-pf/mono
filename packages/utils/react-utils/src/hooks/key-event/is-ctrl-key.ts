import { getPlatform } from '@noshiro/ts-utils';
import { KeyboardEventType } from './key-event-type';

export const isCtrlKey = <T = Element>(
  keyEvent: KeyboardEventType<T>
): boolean => {
  const os = getPlatform();
  switch (os) {
    case 'mac':
      return keyEvent.metaKey;
    case 'windows':
      return keyEvent.ctrlKey;
    default:
      return keyEvent.ctrlKey;
  }
};
