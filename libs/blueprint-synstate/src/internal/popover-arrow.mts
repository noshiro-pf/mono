/** The width and height of Blueprint's popover arrow. */
export const ARROW_SIZE = 30;

/** Half the arrow less the 4px it overlaps the popover, as Blueprint has it. */
export const ARROW_STAND_OFF = `${-(ARROW_SIZE / 2 - 4)}px` as const;

/** Blueprint's `PopoverArrow` paths (`@blueprintjs/core` 6.21). */
export const ARROW_BORDER_PATH =
  'M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z';

export const ARROW_FILL_PATH =
  'M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z';
