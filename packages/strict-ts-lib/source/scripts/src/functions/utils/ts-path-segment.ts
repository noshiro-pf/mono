import { type SemVer } from '../types.mjs';

export const toPathSegment = (tsVersion: SemVer | 'all'): SemVer | '*' =>
  tsVersion === 'all' ? '*' : tsVersion;
