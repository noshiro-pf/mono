export const hexNumberToStr = (hexValue: number): string =>
  // 0xffffff -> '#ffffff'
  `#${hexValue.toString(16)}`;
