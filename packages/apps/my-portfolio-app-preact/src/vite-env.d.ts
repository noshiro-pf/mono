/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="./globals.d.ts" />

/// <reference types="node" />
/// <reference types="preact" />

/// <reference types="vite/client" />

declare module '*.md' {
  // const content: string;
  // export default content;
  const attributes: Record<string, unknown>;

  import React from 'react'
  const ReactComponent: React.FC;

  export { attributes, ReactComponent };
}
