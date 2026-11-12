import {
  mountChild,
  mountable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';

/**
 * SVG's own `<a>` with its tooltip as an SVG `<title>`: synstate-dom's JSX
 * makes `a` and `title` HTML elements wherever they are written, and an HTML
 * `<a>` inside an `<svg>` draws nothing.
 */
export const SvgLink = ({
  href,
  title,
  children,
}: Readonly<{
  /** Read once: a node keyed by its id keeps its address. */
  href: string;
  title: Bindable<string>;
  children: Child;
}>): JSX.Element =>
  mountable(() => {
    const link = document.createElementNS(SVG, 'a');

    link.setAttribute('class', 'dag-link');

    link.setAttribute('href', href);

    link.setAttribute('rel', 'noreferrer');

    link.setAttribute('target', '_blank');

    const tooltip = document.createElementNS(SVG, 'title');

    tooltip.append(...mountChild(title));

    link.append(tooltip, ...mountChild(children));

    return link;
  });

const SVG = 'http://www.w3.org/2000/svg';
