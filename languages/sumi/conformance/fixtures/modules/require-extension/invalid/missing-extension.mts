// `nodenext` resolution is locked on (D-40), so the compiler rejects it too.
// @sumi-expect-error modules/require-extension
// @sumi-expect-error compiler/2835
import { helper } from '../helper';

export const value = helper();
