import { getPlatform } from '@noshiro/ts-utils';

export const isCtrlKey = (keyEvent: Readonly<KeyboardEvent>): boolean => {
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
