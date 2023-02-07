/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="./globals.d.ts" />

/// <reference types="node" />

/// <reference types="vite/client" />

import type { dict as _dict } from './constants/dictionary/dictionary';

declare global {
  const dict: typeof _dict;
}
