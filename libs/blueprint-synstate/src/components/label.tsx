import type { Bindable, Child, JSX } from 'synstate-dom';
import { classObject } from '../internal/index.mjs';

type Props = Readonly<{
  /** The text above the control. */
  text: Bindable<string>;
  /** The control, which Blueprint's style sheets set below the text. */
  children: Child;
  /** The control beside the text rather than below it (`bp6-inline`). */
  inline?: boolean;
  /** Classes after Blueprint's own. */
  class?: string;
}>;

/**
 * Blueprint's `Label`: `label.bp6-label` round its text and the control it
 * names, so that the control needs no `id`.
 */
export const Label = ({
  text,
  children,
  inline = false,
  class: className,
}: Props): JSX.Element => (
  <label class={classObject(['bp6-label', inline && 'bp6-inline', className])}>
    {text}
    {children}
  </label>
);
