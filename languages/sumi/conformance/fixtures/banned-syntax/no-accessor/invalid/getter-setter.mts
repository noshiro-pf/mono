export const box = {
  // @sumi-expect banned-syntax/no-accessor
  get value(): number {
    return 1;
  },
  // @sumi-expect banned-syntax/no-accessor
  set value(next: number) {
    console.log(next);
  },
};
