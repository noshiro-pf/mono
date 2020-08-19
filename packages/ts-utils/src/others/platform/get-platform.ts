export const getPlatform = (): 'mac' | 'windows' | 'other' => {
  if (navigator.platform.toUpperCase().includes('MAC')) {
    // for mac
    return 'mac';
  }
  if (navigator.platform.toUpperCase().includes('WIN')) {
    // for windows
    return 'windows';
  }

  return 'other';
};
