import { mountable, mountChild, type Bindable, type JSX } from 'synstate-dom';

type Props = Readonly<{
  children: Bindable<string>;
}>;

/**
 * An SVG `<title>`: an element's tooltip, and its accessible description.
 *
 * Written out rather than as `<title>` in JSX, which synstate-dom creates as
 * the HTML element of the same name wherever it appears — one a browser neither
 * shows nor reads inside an `<svg>`.
 */
export const SvgTitle = ({ children }: Props): JSX.Element =>
  mountable(() => {
    const title = document.createElementNS(SVG_NAMESPACE, 'title');

    title.append(...mountChild(children));

    return title;
  });

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
