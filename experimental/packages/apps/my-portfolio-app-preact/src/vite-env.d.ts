/// <reference path="./globals.d.ts" />

/// <reference types="preact" />

/// <reference types="vite/client" />

declare module '*.mdx' {
  const MDXComponent: (props) => JSX.Element;
  // eslint-disable-next-line import/no-default-export
  export default MDXComponent;
}
