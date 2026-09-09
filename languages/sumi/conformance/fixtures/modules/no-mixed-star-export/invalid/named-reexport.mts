export * from '../first.mjs';
// @sumi-expect-error modules/no-mixed-star-export
export { second } from '../second.mjs';
