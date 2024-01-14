import { getPlatform } from '@noshiro/ts-utils-additional';

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export const isCtrlKey = (keyEvent: KeyboardEvent): boolean => {
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
