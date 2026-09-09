export const counter = {
  value: 1,
  // (a `function` expression, the only place `this` can appear — reported too)
  // @sumi-expect-error functions/prefer-arrow-function
  read: function (): number {
    // @sumi-expect-error banned-syntax/no-this
    return this.value;
  },
};
