export const box = {
  // @sumi-expect banned-syntax/no-setter
  set value(next: number) {
    console.log(next);
  },
};
