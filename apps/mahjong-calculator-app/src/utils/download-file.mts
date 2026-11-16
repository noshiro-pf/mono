import type { Mutable } from 'ts-type-forge';

/**
 * Hands the browser a URI to save.
 *
 * Ported from `@noshiro/ts-utils-additional`, which `ts-data-forge` has no
 * successor for.
 */
export const downloadFile = (uri: string, filename: string = 'file'): void => {
  const mut_linkElement: Mutable<HTMLAnchorElement> =
    document.createElement('a');

  mut_linkElement.download = filename;

  mut_linkElement.href = uri;

  mut_linkElement.click();
};
