export const counter = {
  value: 1,
  read: function (): number {
    // @sumi-expect banned-syntax/no-this
    return this.value;
  },
};
