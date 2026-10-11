// @sumi-expect-error modules/no-duplicate-import
import type { Helper } from '../helper.mjs';
import { helper } from '../helper.mjs';

export const value: Helper = helper;
