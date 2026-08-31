/**
 * `html2canvas` ships its declarations at `dist/types/index.d.ts` but its
 * `package.json` announces neither `types` nor `exports`, so TypeScript cannot
 * find them. Pointing `paths` at that file makes the module resolve as a
 * namespace rather than a default export, so the signature is declared here
 * instead — it is one function, and this is the only call site.
 */
declare module 'html2canvas' {
  const html2canvas: (
    element: HTMLElement,
    options?: Readonly<{
      width?: number;
      height?: number;
      scale?: number;
      backgroundColor?: string | null;
      windowWidth?: number;
      windowHeight?: number;
      scrollX?: number;
      scrollY?: number;
      useCORS?: boolean;
      logging?: boolean;
    }>,
  ) => Promise<HTMLCanvasElement>;

  // This declaration describes `html2canvas`'s own shape, and what that
  // module exports is a default.
  // eslint-disable-next-line import-x/no-default-export
  export default html2canvas;
}
