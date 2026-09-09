// @sumi-expect-error modules/no-index-file-import
import { fromIndex } from '../index.mjs';

export const value = fromIndex;
