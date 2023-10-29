/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="./globals.d.ts" />

/// <reference types="node" />
/// <reference types="preact" />

/// <reference types="vite/client" />

declare module '*.mdx' {
  const MDXComponent: (props) => JSX.Element;
  export default MDXComponent;
}
