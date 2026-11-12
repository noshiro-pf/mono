import { constant, type Bindable, type Child, type JSX } from 'synstate-dom';

type Props = Readonly<{
  href: Bindable<string>;
  children: Child;
  class?: Bindable<string>;
  title?: Bindable<string>;
}>;

/** A link to GitHub, opened in a new tab. */
export const ExternalLink = (props: Props): JSX.Element => (
  <a
    class={props.class}
    href={props.href}
    rel={constant('noreferrer')}
    target={constant('_blank')}
    title={props.title}
  >
    {props.children}
  </a>
);
