export const getPlatform = (): 'mac' | 'other' | 'windows' => {
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
