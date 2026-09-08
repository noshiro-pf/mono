export const box = {
  // @sumi-expect-error banned-syntax/no-setter
  set value(next: number) {
    console.log(next);
  },
};
