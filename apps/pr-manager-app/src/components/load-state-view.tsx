import * as React from 'react';
import { type LoadState } from '../load-state.mjs';
import { Notice } from './notice.js';
import { ReportView } from './report-view.js';

type Props = Readonly<{ state: LoadState; nowMs: number }>;

/** What the state says, once there is a token to have read with. */
export const LoadStateView = React.memo<Props>((props) => {
  const { state, nowMs } = props;

  switch (state.type) {
    case 'loading':
      return <Notice tone={'neutral'}>{'Reading GitHub…'}</Notice>;

    case 'failed':
      return <Notice tone={'critical'}>{state.message}</Notice>;

    case 'ready':
      return <ReportView nowMs={nowMs} report={state.report} />;
  }
});

LoadStateView.displayName = 'LoadStateView';
