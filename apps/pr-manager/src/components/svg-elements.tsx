import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * A `ref` that writes attributes the props of an SVG element do not take:
 * synstate-dom takes a fixed list of SVG attributes, which leaves out
 * `focusable`. Constant ones only, which is all this page has. This goes once
 * the library can say it itself.
 */
export const svgAttributes =
  (attributes: ReadonlyRecord<string, string>) =>
  (element: Element): void => {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
  };
