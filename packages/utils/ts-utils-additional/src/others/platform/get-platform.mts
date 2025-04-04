export const getPlatform = (): 'mac' | 'other' | 'windows' => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated, unicorn/prefer-global-this
  if (window.navigator.platform.toUpperCase().includes('MAC')) {
    // for mac
    return 'mac';
  }
  // eslint-disable-next-line @typescript-eslint/no-deprecated, unicorn/prefer-global-this
  if (window.navigator.platform.toUpperCase().includes('WIN')) {
    // for windows
    return 'windows';
  }

  return 'other';
};
