// @sumi-expect-error modules/no-mixed-star-export
import { first } from '../first.mjs';

export * from '../second.mjs';

// @sumi-expect-error modules/no-mixed-star-export
export const doubled = first * 2;
