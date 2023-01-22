/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference no-default-lib="true"/>
/// <reference path="../../../utils/stdlib/dist/lib.dom.d.ts" />
/// <reference path="../../../utils/stdlib/dist/lib.esnext.d.ts" />
/// <reference path="../../../utils/ts-type-utils/ts-type-utils.d.ts" />
/// <reference path="../../../utils/global-goober/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-preact/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-preact-utils/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-syncflow/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-syncflow-preact-hooks/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-tiny-router-observable/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-tiny-router-preact-hooks/esm/globals-decl.d.ts" />
/// <reference path="../../../utils/global-ts-utils/esm/globals-decl.d.ts" />

/// <reference types="node" />

/// <reference types="vite/client" />

declare module '*.md' {
  // const content: string;
  // export default content;
  const attributes: Record<string, unknown>;

  import React from 'react'
  const ReactComponent: React.VFC;

  export { attributes, ReactComponent };
}
