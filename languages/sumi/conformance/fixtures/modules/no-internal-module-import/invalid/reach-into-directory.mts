// @sumi-expect modules/no-internal-module-import
import { sibling } from '../valid/helper.mjs';

export const value = sibling;
