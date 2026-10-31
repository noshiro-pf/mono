import { constant, type Child, type JSX } from 'synstate-dom';
import type { StatusRole } from '../verdict.mjs';

type Props = Readonly<{ tone: StatusRole; children: Child }>;

/**
 * Everything the page says when it has no report to show.
 *
 * An `<output>` rather than a `<p role="status">`: the element already carries
 * the live region, and the two together are one announcement written twice.
 */
export const Notice = ({ tone, children }: Props): JSX.Element => (
  <output class={constant('notice')} data-status={constant(tone)}>
    {children}
  </output>
);
