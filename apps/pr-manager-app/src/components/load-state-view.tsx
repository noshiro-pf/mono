import { memoNamed } from 'preact-utils';
import { type LoadStatus } from '../load-state.mjs';
import { Notice } from './notice.js';
import { ReportView } from './report-view.js';

type Props = Readonly<{ loadStatus: LoadStatus }>;

/** What the status says, once there is a token to have read with. */
export const LoadStateView = memoNamed<Props>('LoadStateView', (props) => {
  const { loadStatus } = props;

  switch (loadStatus.type) {
    case 'loading':
      return <Notice tone={'neutral'}>{'Reading GitHub…'}</Notice>;

    case 'failed':
      return <Notice tone={'critical'}>{loadStatus.message}</Notice>;

    case 'ready':
      return <ReportView />;
  }
});
