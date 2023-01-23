/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference no-default-lib="true"/>
/// <reference path="../../../utils/stdlib/dist/lib.dom.d.ts" />
/// <reference path="../../../utils/stdlib/dist/lib.esnext.d.ts" />
/// <reference path="../../../utils/ts-type-utils/ts-type-utils.d.ts" />
/// <reference path="../../../utils/global-react/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-react-utils/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-styled-components/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-syncflow/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-syncflow-react-hooks/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-tiny-router-observable/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-tiny-router-react-hooks/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-ts-utils/esm/globals-decl.d.ts" />

/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

/// <reference types="vite/client" />

import type { dict as _dict } from './constants/dictionary/dictionary';

declare global {
  const dict: typeof _dict;
}
