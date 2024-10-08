/// <reference path="./globals.d.ts" />

/// <reference types="react" />
/// <reference types="react-dom" />

/// <reference types="vite/client" />

import { type dict as dict_ } from './constants';

declare global {
  const dict: typeof dict_;
}
