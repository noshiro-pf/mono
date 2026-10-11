// @sumi-expect-error modules/no-duplicate-import
import { helper } from '../helper.mjs';
import { other } from '../helper.mjs';

export const value = helper + other;
