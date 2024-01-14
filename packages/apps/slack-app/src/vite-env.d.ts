/// <reference path="./globals.d.ts" />

/// <reference types="node" />

/// <reference types="vite/client" />

import { type dict as _dict } from './constants';

declare global {
  const dict: typeof _dict;
}
