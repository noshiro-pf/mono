export const counter = {
  value: 1,
  // (a `function` expression, the only place `this` can appear — reported too)
  // @sumi-expect functions/prefer-arrow-function
  read: function (): number {
    // @sumi-expect banned-syntax/no-this
    return this.value;
  },
};
