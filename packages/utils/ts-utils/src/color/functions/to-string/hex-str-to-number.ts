export const hexStrToNumber = (hexStr: string): number =>
  // '#ffffff' -> 0xffffff
  parseInt(`0x${hexStr.slice(1)}`, 16);
