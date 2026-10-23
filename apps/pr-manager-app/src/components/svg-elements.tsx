import {
  mountChild,
  mountable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * What synstate-dom's JSX cannot write inside an `<svg>` yet, written here by
 * hand.
 *
 * It makes `a`, `title`, `script` and `style` HTML elements wherever they are
 * written (its SPEC.md 5.2), and an HTML `<a>` inside an `<svg>` draws
 * nothing, nor does an HTML `<title>` name it; and it takes a fixed list of
 * SVG attributes, which leaves out `focusable`. Each of these
 * goes once the library can say them itself.
 */

type LinkProps = Readonly<{
  /** Read once: a node keyed by its number keeps its URL. */
  href: string;
  /** The tooltip, and what a screen reader announces. */
  title: Bindable<string>;
  children: Child;
}>;

/**
 * SVG's own `<a>`, opening in a tab of its own as every link on the page
 * does (`external-link.tsx`), with its tooltip as the SVG `<title>` inside
 * it, which is what an SVG element has instead of a `title` attribute.
 */
export const SvgLink = ({ href, title, children }: LinkProps): JSX.Element =>
  mountable(() => {
    const link = document.createElementNS(SVG_NAMESPACE, 'a');

    link.setAttribute('class', 'issue-dag-link');

    link.setAttribute('href', href);

    link.setAttribute('rel', 'noreferrer');

    link.setAttribute('target', '_blank');

    link.append(svgTitle(title), ...mountChild(children));

    return link;
  });

/** SVG's own `<title>`, which names the drawing it is the first child of. */
export const SvgTitle = ({
  children,
}: Readonly<{ children: Bindable<string> }>): JSX.Element =>
  mountable(() => svgTitle(children));

/**
 * A `ref` that writes attributes the props of an SVG element do not take.
 * Constant ones only, which is all this page has.
 */
export const svgAttributes =
  (attributes: ReadonlyRecord<string, string>) =>
  (element: Element): void => {
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
  };

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/** Its text is bound in the current scope, as any text child is. */
const svgTitle = (text: Bindable<string>): SVGTitleElement => {
  const title = document.createElementNS(SVG_NAMESPACE, 'title');

  title.append(...mountChild(text));

  return title;
};
