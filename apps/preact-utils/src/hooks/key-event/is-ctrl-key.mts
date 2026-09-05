import { getPlatform } from '../../utils/index.mjs';

export const isCtrlKey = (keyEvent: KeyboardEvent): boolean => {
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
