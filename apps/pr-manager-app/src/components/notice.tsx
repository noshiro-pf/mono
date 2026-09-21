import * as React from 'react';
import { type StatusRole } from '../verdict.mjs';

type Props = Readonly<{ tone: StatusRole; children: React.ReactNode }>;

/**
 * Everything the page says when it has no report to show.
 *
 * An `<output>` rather than a `<p role="status">`: the element already
 * carries the live region, and the two together are one announcement written
 * twice.
 */
export const Notice = React.memo<Props>(({ tone, children }) => (
  <output className={'notice'} data-status={tone}>
    {children}
  </output>
));

Notice.displayName = 'Notice';
