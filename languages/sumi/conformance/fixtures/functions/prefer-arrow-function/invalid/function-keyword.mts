// @sumi-expect-error functions/prefer-arrow-function
export function plain(): number {
  return 1;
}

// @sumi-expect-error functions/prefer-arrow-function
export const expression = function (): number {
  return 2;
};

export const shorthand = {
  // @sumi-expect-error functions/prefer-arrow-function
  method(): number {
    return 3;
  },
};
