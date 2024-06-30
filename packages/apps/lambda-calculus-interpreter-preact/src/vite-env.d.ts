/// <reference path="./globals.d.ts" />

/// <reference types="preact" />

/// <reference types="vite/client" />

import { type dict as _dict } from './constants';

declare global {
  const dict: typeof _dict;
}
